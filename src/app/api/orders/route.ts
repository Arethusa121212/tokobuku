import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId, paymentProof, status } = await req.json();

    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }

    // If it's a seller updating status
    if (status && session.user.role === "SELLER") {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status }
      });
      return NextResponse.json({ message: "Status updated", order: updatedOrder }, { status: 200 });
    }

    // If it's a customer uploading proof
    if (paymentProof) {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentProof,
          status: "PROCESSING" // Automatically move to processing after upload
        }
      });
      return NextResponse.json({ message: "Bukti bayar berhasil diunggah", order: updatedOrder }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  } catch (error: any) {
    console.error("ORDER_UPDATE_ERROR:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
