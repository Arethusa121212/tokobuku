import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: any }) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === "SELLER") {
    redirect("/dashboard");
  }
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || "";
  const categoryFilter = resolvedParams?.category || "";

  // Build where clause
  const where: any = {};
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (categoryFilter) {
    where.category = { name: categoryFilter };
  }

  const books = await prisma.book.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div style={{ padding: '2rem 0' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #00AA5B 0%, #008C4A 100%)',
        color: 'white', padding: '4rem 2rem', borderRadius: '24px',
        marginBottom: '3rem', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,170,91,0.15)'
      }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '1rem' }}>Temukan Buku Favoritmu</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '0' }}>Jelajahi koleksi buku terbaik dengan harga terjangkau</p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
            <Link
              href="/"
              style={{
                padding: '0.5rem 1.2rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s',
                background: !categoryFilter ? 'var(--color-primary)' : 'var(--color-surface)',
                color: !categoryFilter ? 'white' : 'var(--color-text-secondary)',
                border: !categoryFilter ? 'none' : '1.5px solid var(--color-border)',
              }}
            >
              Semua
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.name}`}
                style={{
                  padding: '0.5rem 1.2rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.2s',
                  background: categoryFilter === cat.name ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: categoryFilter === cat.name ? 'white' : 'var(--color-text-secondary)',
                  border: categoryFilter === cat.name ? 'none' : '1.5px solid var(--color-border)',
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search result info */}
      {search && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Hasil pencarian untuk: <strong style={{ color: 'var(--color-text-primary)' }}>&quot;{search}&quot;</strong> ({books.length} buku)
          </p>
          <Link href="/" style={{ color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 600 }}>Reset</Link>
        </div>
      )}

      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        {categoryFilter ? `Kategori: ${categoryFilter}` : search ? 'Hasil Pencarian' : 'Buku Terbaru'}
      </h2>

      {books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)', background: 'var(--color-surface)', borderRadius: '20px' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</p>
          <p style={{ fontSize: '1.1rem' }}>
            {search ? 'Tidak ada buku yang cocok dengan pencarian Anda.' : 'Belum ada buku yang tersedia saat ini.'}
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {books.map((book) => (
            <Link href={`/books/${book.id}`} key={book.id} className="product-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={book.imageUrl || 'https://via.placeholder.com/300x400?text=Cover+Buku'} alt={book.title} className="product-image" />
              <div className="product-info">
                {book.category && (
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)',
                    background: '#f0fdf4', padding: '0.2rem 0.6rem', borderRadius: '10px',
                    display: 'inline-block', marginBottom: '0.4rem', width: 'fit-content'
                  }}>
                    {book.category.name}
                  </span>
                )}
                <h3 className="product-title">{book.title}</h3>
                <div className="product-price">
                  Rp {book.price.toLocaleString('id-ID')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
