import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id }
        ]
      },
      include: {
        user1: { select: { id: true, name: true, image: true, isOnline: true } },
        user2: { select: { id: true, name: true, image: true, isOnline: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    // Count unread messages for this user
    const unreadCounts = await Promise.all(conversations.map(async (conv) => {
      const count = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: session.user.id },
          isRead: false
        }
      });
      return { conversationId: conv.id, count };
    }));

    return NextResponse.json({ conversations, unreadCounts });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching rooms", error: error.message }, { status: 500 });
  }
}
