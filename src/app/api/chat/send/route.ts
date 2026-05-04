import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { text, receiverId, bookId } = await req.json();

    if (!text || !receiverId) {
      return NextResponse.json({ message: "Missing text or receiverId" }, { status: 400 });
    }

    // Sort IDs to keep conversation unique
    const user1Id = [session.user.id, receiverId].sort()[0];
    const user2Id = [session.user.id, receiverId].sort()[1];

    // Find or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        user1Id_user2Id: { user1Id, user2Id }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { user1Id, user2Id }
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        text,
        conversationId: conversation.id,
        senderId: session.user.id,
        bookId: bookId || null,
      },
      include: {
        sender: { select: { name: true, image: true } },
        book: { select: { title: true, imageUrl: true, price: true } }
      }
    });

    // Update lastMessageAt
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() }
    });

    // Trigger Pusher
    await pusherServer.trigger(conversation.id, "new-message", message);
    
    // Trigger notification for receiver
    await pusherServer.trigger(`user-${receiverId}`, "new-notification", {
      from: session.user.name,
      text: text.substring(0, 50),
      conversationId: conversation.id
    });

    return NextResponse.json(message);
  } catch (error: any) {
    return NextResponse.json({ message: "Error sending message", error: error.message }, { status: 500 });
  }
}
