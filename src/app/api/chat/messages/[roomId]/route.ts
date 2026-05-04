import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const roomId = resolvedParams.roomId;

    const messages = await prisma.message.findMany({
      where: { conversationId: roomId },
      include: {
        sender: { select: { name: true, image: true } },
        book: { select: { title: true, imageUrl: true, price: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: roomId,
        senderId: { not: session.user.id },
        isRead: false
      },
      data: { isRead: true }
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching messages", error: error.message }, { status: 500 });
  }
}
