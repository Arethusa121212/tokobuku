import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "SELLER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "File tidak ditemukan" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF" },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Ukuran file maksimal 2MB" },
        { status: 400 }
      );
    }

    // Convert to base64 data URL (works on Vercel serverless)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const imageUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ message: "Upload berhasil", imageUrl }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Gagal mengupload file", error: error.message },
      { status: 500 }
    );
  }
}
