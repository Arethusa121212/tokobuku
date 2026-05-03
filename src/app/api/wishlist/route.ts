import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bookId } = await req.json();

    if (!bookId) {
      return NextResponse.json({ message: "Book ID is required" }, { status: 400 });
    }

    // Check if already wishlisted
    const existing = await prisma.wishlist.findFirst({
      where: {
        userId: session.user.id,
        bookId: bookId
      }
    });

    if (existing) {
      // Remove from wishlist
      await prisma.wishlist.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ message: "Dihapus dari Wishlist", active: false }, { status: 200 });
    } else {
      // Add to wishlist
      await prisma.wishlist.create({
        data: {
          userId: session.user.id,
          bookId: bookId
        }
      });
      return NextResponse.json({ message: "Ditambahkan ke Wishlist", active: true }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: { book: true }
    });

    return NextResponse.json(wishlist, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
