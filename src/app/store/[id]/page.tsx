import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const storeId = resolvedParams.id;

  const store = await prisma.user.findUnique({
    where: { id: storeId },
    include: {
      books: {
        include: {
          category: true,
          reviews: { select: { rating: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!store || store.role !== "SELLER") {
    return notFound();
  }

  // Calculate store stats
  const totalBooks = store.books.length;
  const allReviews = store.books.flatMap(book => book.reviews);
  const avgRating = allReviews.length > 0 
    ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length 
    : 0;

  // Simulate shipping speed based on some logic or static
  const shippingSpeed = "Kilat (± 1 Hari)"; 
  const totalSales = 124; // Mock for now

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
        {/* Store Header Card */}
        <div style={{
          background: 'white', borderRadius: '32px', padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)',
          marginBottom: '3rem', position: 'relative', overflow: 'hidden'
        }}>
          {/* Background Decoration */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '300px', height: '100%',
            background: 'linear-gradient(225deg, var(--color-primary-light) 0%, transparent 70%)',
            opacity: 0.5, zIndex: 0
          }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            {/* Avatar */}
            <div style={{
              width: '120px', height: '120px', borderRadius: '35px',
              overflow: 'hidden', border: '4px solid white', boxShadow: 'var(--shadow-md)'
            }}>
              <img 
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${store.name}`} 
                alt={store.name || "Store"} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                  {store.name}
                </h1>
                <span style={{ 
                  background: 'var(--color-primary)', color: 'white', 
                  padding: '0.3rem 0.8rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 
                }}>
                  Official Store
                </span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: store.isOnline ? '#22c55e' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: store.isOnline ? '#22c55e' : '#94a3b8', boxShadow: store.isOnline ? '0 0 8px rgba(34, 197, 94, 0.5)' : 'none' }}></div>
                  {store.isOnline ? 'Sedang Aktif' : 'Offline'}
                </div>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginBottom: '1.2rem', maxWidth: '600px' }}>
                {store.storeDescription || "Selamat datang di toko kami! Kami menyediakan berbagai koleksi buku terbaik dengan pelayanan prima."}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>📍 {store.location || 'Indonesia'}</span>
                <span>📅 Bergabung {new Date(store.joinedAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                <span style={{ color: 'var(--color-primary)' }}>✅ Terverifikasi</span>
              </div>
            </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button 
                  onClick={() => {
                    const event = new CustomEvent("openChat", { 
                      detail: { sellerId: store.id, sellerName: store.name } 
                    });
                    window.dispatchEvent(event);
                  }}
                  className="btn-primary" 
                  style={{ padding: '1rem 2.5rem', borderRadius: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  💬 Chat di Website
                </button>
                
                {store.whatsapp && (
                  <a 
                    href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      padding: '0.8rem', borderRadius: '16px', border: '1.5px solid #25D366',
                      fontWeight: 700, color: '#25D366', background: 'white', textDecoration: 'none', textAlign: 'center', fontSize: '0.9rem'
                    }}
                  >
                    WhatsApp
                  </a>
                )}
              </div>
          </div>

          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />
        </div>

        {/* Store Content */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Koleksi Buku di Toko Ini</h2>
          <div style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{totalBooks} Buku ditemukan</div>
        </div>

        <div className="product-grid">
          {store.books.map((book) => {
            const bookAvgRating = book.reviews.length > 0 
              ? book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviews.length 
              : 0;

            return (
              <div key={book.id} className="product-card animate-fade-in">
                <Link href={`/books/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="product-image-container">
                    <img src={book.imageUrl || 'https://via.placeholder.com/300x400'} alt={book.title} className="product-image" />
                    {book.stock <= 5 && book.stock > 0 && (
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#EF144A', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>
                        STOK TERBATAS!
                      </div>
                    )}
                  </div>
                </Link>
                <div className="product-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '0.2rem 0.5rem', borderRadius: '8px' }}>
                      {book.category?.name || 'Umum'}
                    </span>
                    {bookAvgRating > 0 && <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b' }}>⭐ {bookAvgRating.toFixed(1)}</span>}
                  </div>
                  <Link href={`/books/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="product-title">{book.title}</h3>
                  </Link>
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>Rp {book.price.toLocaleString('id-ID')}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.3rem' }}>
                      📦 Stok: {book.stock}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
