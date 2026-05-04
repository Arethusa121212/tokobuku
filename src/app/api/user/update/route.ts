import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, storeDescription, location, whatsapp, image, bankName, accountNumber, accountHolder } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        storeDescription,
        location,
        whatsapp,
        image,
        bankName,
        accountNumber,
        accountHolder,
      },
    });

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ message: "Error updating profile", error: error.message }, { status: 500 });
  }
}
