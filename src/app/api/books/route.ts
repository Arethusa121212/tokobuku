import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "SELLER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, price, stock, imageUrl } = await req.json();

    if (!title || !description || price === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newBook = await prisma.book.create({
      data: {
        title,
        description,
        price,
        stock,
        imageUrl,
        sellerId: session.user.id,
      }
    });

    revalidatePath("/");
    return NextResponse.json({ message: "Book created", book: newBook }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "SELLER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const bookId = url.searchParams.get("id");

    if (!bookId) {
      return NextResponse.json({ message: "Book ID is required" }, { status: 400 });
    }

    // Verify ownership
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    
    if (!book || book.sellerId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized or Book not found" }, { status: 403 });
    }

    await prisma.book.delete({
      where: { id: bookId }
    });

    revalidatePath("/");
    return NextResponse.json({ message: "Book deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
