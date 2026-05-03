import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ background: 'var(--color-primary)', color: 'white', padding: '4rem 2rem', borderRadius: '16px', marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Temukan Buku Favoritmu</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Jelajahi koleksi buku terbaik dengan harga terjangkau</p>
      </div>

      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>Buku Terbaru</h2>

      {books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)', background: 'var(--color-surface)', borderRadius: '12px' }}>
          Belum ada buku yang tersedia saat ini.
        </div>
      ) : (
        <div className="product-grid">
          {books.map((book) => (
            <Link href={`/books/${book.id}`} key={book.id} className="product-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={book.imageUrl || 'https://via.placeholder.com/300x400?text=Cover+Buku'} alt={book.title} className="product-image" />
              <div className="product-info">
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
