import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "SELLER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get seller's book IDs
    const sellerBooks = await prisma.book.findMany({
      where: { sellerId: session.user.id },
      select: { id: true },
    });
    const bookIds = sellerBooks.map((b) => b.id);

    // Get order items for these books where order status is SHIPPED or DELIVERED
    const sales = await prisma.orderItem.findMany({
      where: { 
        bookId: { in: bookIds },
        order: {
          status: { in: ["SHIPPED", "DELIVERED"] }
        }
      },
      include: {
        book: true,
        order: {
          include: { user: { select: { name: true, email: true } } }
        }
      },
      orderBy: { order: { updatedAt: "desc" } }
    });

    return NextResponse.json(sales);
  } catch (error: any) {
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
