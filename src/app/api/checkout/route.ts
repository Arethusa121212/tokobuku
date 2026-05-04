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

    const { address } = await req.json();

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { book: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ message: "Keranjang kosong" }, { status: 400 });
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (acc, item) => acc + item.book.price * item.quantity,
      0
    );

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          address: address || null,
          status: "PENDING",
          items: {
            create: cartItems.map((item) => ({
              bookId: item.bookId,
              quantity: item.quantity,
              price: item.book.price,
            })),
          },
        },
        include: { items: true },
      });

      // Reduce stock for each book
      for (const item of cartItems) {
        await tx.book.update({
          where: { id: item.bookId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      });

      return newOrder;
    });

    return NextResponse.json(
      { message: "Pesanan berhasil dibuat!", order },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CHECKOUT_ERROR:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat checkout", error: error.message },
      { status: 500 }
    );
  }
}
