import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "SELLER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, price, stock, categoryId } = await req.json();

    // Verify ownership
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book || book.sellerId !== session.user.id) {
      return NextResponse.json({ message: "Buku tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        title: title || undefined,
        price: price ? Number(price) : undefined,
        stock: stock ? Number(stock) : undefined,
        categoryId: categoryId || undefined,
      },
    });

    return NextResponse.json(updatedBook);
  } catch (error: any) {
    return NextResponse.json({ message: "Gagal memperbarui buku", error: error.message }, { status: 500 });
  }
}
