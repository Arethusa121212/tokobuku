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

    const { bookId, rating, comment } = await req.json();

    if (!bookId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Book ID dan rating (1-5) diperlukan" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this book
    const existing = await prisma.review.findFirst({
      where: { userId: session.user.id, bookId },
    });

    if (existing) {
      // Update existing review
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment: comment || null },
        include: { user: { select: { name: true, image: true } } },
      });
      return NextResponse.json(
        { message: "Review diperbarui", review: updated },
        { status: 200 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        bookId,
        rating,
        comment: comment || null,
      },
      include: { user: { select: { name: true, image: true } } },
    });

    return NextResponse.json(
      { message: "Review berhasil ditambahkan", review },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("REVIEW_ERROR:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const bookId = url.searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json(
        { message: "Book ID diperlukan" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { bookId },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json(
      { reviews, avgRating, totalReviews: reviews.length },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
