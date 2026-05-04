import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");

    if (!targetId) {
      return NextResponse.json({ message: "Missing targetId" }, { status: 400 });
    }

    const user1Id = [session.user.id, targetId].sort()[0];
    const user2Id = [session.user.id, targetId].sort()[1];

    const conversationInclude = {
      messages: {
        include: {
          sender: { select: { name: true, image: true } },
          book: { select: { title: true, imageUrl: true, price: true } }
        },
        orderBy: { createdAt: 'asc' as const }
      }
    };

    let conversation = await prisma.conversation.findUnique({
      where: {
        user1Id_user2Id: { user1Id, user2Id }
      },
      include: conversationInclude
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { user1Id, user2Id },
        include: conversationInclude
      });
    }

    return NextResponse.json({ roomId: conversation.id, messages: conversation.messages });
  } catch (error: any) {
    return NextResponse.json({ message: "Error init chat", error: error.message }, { status: 500 });
  }
}
