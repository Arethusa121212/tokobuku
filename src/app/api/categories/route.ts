import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    // Auto-seed if empty
    if (categories.length === 0) {
      const commonCategories = [
        "Fiksi Umum", "Fantasi", "Fiksi Ilmiah (Sci-Fi)", "Misteri & Thriller",
        "Romantis", "Horor", "Fiksi Sejarah", "Komik & Graphic Novel",
        "Biografi & Memoar", "Pengembangan Diri (Self-Help)", "Bisnis & Ekonomi",
        "Sejarah", "Sains & Teknologi", "Filsafat", "Agama & Spiritualitas",
        "Kesehatan & Kebugaran", "Masakan & Makanan", "Seni & Fotografi",
        "Panduan Wisata", "Pendidikan & Akademik", "Anak-anak", "Hukum", "Politik"
      ];
      
      await prisma.category.createMany({
        data: commonCategories.map(name => ({ name })),
        skipDuplicates: true
      });

      categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json(categories, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Kategori sudah ada" }, { status: 409 });
    }
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
