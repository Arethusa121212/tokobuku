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

    const { bookId, quantity = 1 } = await req.json();

    if (!bookId) {
      return NextResponse.json({ message: "Book ID is required" }, { status: 400 });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: bookId,
        }
      }
    });

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
      return NextResponse.json({ message: "Keranjang diperbarui", item: updatedItem }, { status: 200 });
    }

    // Add new item to cart
    const newItem = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        bookId: bookId,
        quantity: quantity
      }
    });

    return NextResponse.json({ message: "Berhasil ditambah ke keranjang", item: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const cartItemId = url.searchParams.get("id");

    if (!cartItemId) {
      return NextResponse.json({ message: "Cart Item ID is required" }, { status: 400 });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });

    return NextResponse.json({ message: "Item removed from cart" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { cartItemId, quantity } = await req.json();

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json({ message: "Cart Item ID and quantity are required" }, { status: 400 });
    }

    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return NextResponse.json({ message: "Item removed" }, { status: 200 });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: quantity }
    });

    return NextResponse.json({ message: "Quantity updated", item: updatedItem }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
