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

    const { name, image, bankAccount } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        image: image || undefined,
        bankAccount: bankAccount || undefined,
      },
    });

    return NextResponse.json({ 
      message: "Profil berhasil diperbarui", 
      user: { name: updatedUser.name, image: updatedUser.image, bankAccount: updatedUser.bankAccount } 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ 
      message: "Gagal memperbarui profil", 
      error: error.message 
    }, { status: 500 });
  }
}
