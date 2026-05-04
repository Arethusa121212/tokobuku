import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { isOnline } = await req.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        isOnline,
        lastSeen: new Date()
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: "Error updating status", error: error.message }, { status: 500 });
  }
}
