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
  const minPrice = parseInt(resolvedParams?.minPrice) || 0;
  const maxPrice = parseInt(resolvedParams?.maxPrice) || 0;
  const minRating = parseInt(resolvedParams?.minRating) || 0;
  const inStock = resolvedParams?.inStock === "true";

  // Build where clause
  const where: any = {};
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (categoryFilter) {
    where.category = { name: categoryFilter };
  }
  if (minPrice > 0 || maxPrice > 0) {
    where.price = {};
    if (minPrice > 0) where.price.gte = minPrice;
    if (maxPrice > 0) where.price.lte = maxPrice;
  }
  if (inStock) {
    where.stock = { gt: 0 };
  }

  let books = await prisma.book.findMany({
    where,
    include: { 
      category: true,
      seller: { select: { id: true, name: true } },
      reviews: { select: { rating: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter by rating in memory
  if (minRating > 0) {
    books = books.filter(book => {
      const avg = book.reviews.length > 0 
        ? book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviews.length 
        : 0;
      return avg >= minRating;
    });
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const totalBooks = await prisma.book.count();

  // Fetch Top Sellers (Top 3 by avg rating)
  const topBooks = await prisma.book.findMany({
    take: 3,
    include: { reviews: true, category: true },
    orderBy: { reviews: { _count: 'desc' } } // Simple proxy for popularity
  });

  // Fetch Recent Reviews
  const recentReviews = await prisma.review.findMany({
    take: 3,
    include: { user: { select: { name: true } }, book: { select: { title: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Premium Hero Section */}
      <div className="hero-gradient" style={{
        color: 'white', padding: '5rem 1.5rem', borderRadius: '0 0 40px 40px',
        marginBottom: '2.5rem', textAlign: 'center', margin: '0 -1rem',
        boxShadow: '0 10px 30px rgba(0,170,91,0.1)', position: 'relative'
      }}>
        <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 900, marginBottom: '1rem', 
            letterSpacing: '-1.5px', lineHeight: 1.1 
          }}>
            Surga Buku <br/><span style={{ color: '#FFD700' }}>Para Kolektor</span>
          </h1>
          <p style={{ 
            fontSize: 'clamp(0.95rem, 3vw, 1.25rem)', opacity: 0.9, 
            marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' 
          }}>
            Jelajahi ribuan koleksi buku langka, populer, dan edukatif dari penjual terpercaya.
          </p>
          <div style={{ 
            maxWidth: '600px', margin: '0 auto', background: 'white', 
            padding: '0.4rem', borderRadius: '16px', display: 'flex',
            boxShadow: '0 15px 45px rgba(0,0,0,0.2)' 
          }}>
            <input 
              type="text" 
              placeholder="Cari buku..." 
              style={{ flex: 1, border: 'none', padding: '0 1rem', outline: 'none', color: '#333', fontSize: '0.95rem', minWidth: '0' }}
            />
            <button className="btn-primary" style={{ padding: '0.7rem 1.5rem', borderRadius: '12px' }}>Cari</button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="home-layout">
          {/* LEFT SIDEBAR */}
          <aside className="sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">📂 Kategori Lengkap</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {categories.map(cat => (
                  <Link key={cat.id} href={`/?category=${cat.name}`} style={{ 
                    fontSize: '0.85rem', color: categoryFilter === cat.name ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: categoryFilter === cat.name ? 800 : 500,
                    transition: 'all 0.2s'
                  }}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>


          </aside>

          {/* MAIN CONTENT */}
          <div className="main-content">
            {/* Category Highlights */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Pilihan Populer</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', padding: '0.5rem 0', scrollbarWidth: 'none' }}>
                {[
                  { name: 'Fiksi', icon: '📖' },
                  { name: 'Bisnis', icon: '📈' },
                  { name: 'Teknologi', icon: '💻' },
                  { name: 'Sejarah', icon: '🏺' },
                  { name: 'Anak', icon: '🧸' },
                ].map((cat) => (
                  <Link key={cat.name} href={`/?category=${cat.name}`} style={{
                      minWidth: '80px', padding: '1rem', background: 'white',
                      borderRadius: '20px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-sm)',
                      border: '1px solid var(--color-border)'
                    }}>
                    <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Filter Bar */}
            <div style={{ marginBottom: '2.5rem' }}>
              <form method="GET" action="/" style={{
                background: 'white', padding: '1.2rem', borderRadius: '20px',
                boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)',
                display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end'
              }}>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-text-secondary)' }}>Harga</label>
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    <input type="number" name="minPrice" placeholder="Min" defaultValue={resolvedParams?.minPrice} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.8rem', outline: 'none' }} />
                    <input type="number" name="maxPrice" placeholder="Max" defaultValue={resolvedParams?.maxPrice} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.8rem', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-text-secondary)' }}>Rating</label>
                  <select name="minRating" defaultValue={resolvedParams?.minRating || "0"} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.8rem', outline: 'none', background: 'white' }}>
                    <option value="0">Semua</option>
                    <option value="4">⭐ 4+ Bintang</option>
                    <option value="3">⭐ 3+ Bintang</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem' }}>Filter</button>
              </form>
            </div>

            {/* Book List */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{categoryFilter || 'Semua Buku'}</h2>
            </div>

            {books.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '24px' }}>
                <div style={{ fontSize: '3rem' }}>📭</div>
                <p>Tidak ada buku yang sesuai filter.</p>
              </div>
            ) : (
              <div className="product-grid">
                {books.map((book) => {
                  const avgRating = book.reviews.length > 0 
                    ? book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviews.length 
                    : 0;
                  return (
                    <div key={book.id} className="product-card animate-fade-in">
                      <Link href={`/books/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="product-image-container">
                          <img src={book.imageUrl || 'https://via.placeholder.com/300x400?text=Cover'} alt={book.title} className="product-image" />
                        </div>
                      </Link>
                      <div className="product-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '0.2rem 0.5rem', borderRadius: '8px' }}>
                            {book.category?.name || 'Umum'}
                          </span>
                          {avgRating > 0 && <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b' }}>⭐ {avgRating.toFixed(1)}</span>}
                        </div>
                        <Link href={`/books/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h3 className="product-title">{book.title}</h3>
                        </Link>
                        <div style={{ marginTop: 'auto' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>Rp {book.price.toLocaleString('id-ID')}</div>
                          <Link href={`/store/${book.seller?.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.7rem', marginTop: '0.3rem', textDecoration: 'none' }} className="seller-link">
                            <span>👤 {book.seller?.name || 'Anonim'}</span>
                          </Link>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.3rem' }}>
                            📦 Stok: {book.stock}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">🔥 Buku Terlaris</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {topBooks.map(book => (
                  <Link key={book.id} href={`/books/${book.id}`} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <img src={book.imageUrl || 'https://via.placeholder.com/300x400'} alt="" style={{ width: '50px', height: '65px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 800 }}>Rp {book.price.toLocaleString('id-ID')}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-title">💬 Ulasan Terbaru</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {recentReviews.map(review => (
                  <div key={review.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{review.user.name}</span>
                      <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>{'⭐'.repeat(review.rating)}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      &quot;{review.comment || 'Puas dengan bukunya!'}&quot;
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', marginTop: '0.4rem', fontWeight: 600 }}>
                      pada {review.book.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Newsletter Section */}
        <div style={{
          marginTop: '6rem', background: '#1a1a1a', borderRadius: '32px',
          padding: '4rem 2rem', textAlign: 'center', color: 'white',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Komunitas Pembaca Kami</h2>
            <p style={{ opacity: 0.8, marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
              Bergabunglah dengan ribuan kolektor buku lainnya dan dapatkan info promo eksklusif.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '450px', margin: '0 auto' }}>
              <input type="email" placeholder="Email Anda..." style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', outline: 'none' }} />
              <button className="btn-primary">Daftar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


