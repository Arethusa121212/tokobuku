import prisma from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: any }) {
  try {
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
      include: { 
        category: true,
        seller: { select: { name: true } },
        reviews: { select: { rating: true } }
      },
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
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
        {/* Category Highlights */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Kategori Populer</h2>
            <Link href="/" style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem' }}>Lihat Semua →</Link>
          </div>
          <div style={{ display: 'flex', gap: '1.2rem', overflowX: 'auto', padding: '0.5rem 0', scrollbarWidth: 'none' }}>
            {[
              { name: 'Fiksi', icon: '🎨', color: '#FF6B6B' },
              { name: 'Bisnis', icon: '📈', color: '#4D96FF' },
              { name: 'Teknologi', icon: '💻', color: '#6BCB77' },
              { name: 'Sejarah', icon: '🏺', color: '#FFD93D' },
              { name: 'Anak', icon: '🧸', color: '#92A9BD' },
              { name: 'Edukasi', icon: '🎓', color: '#B983FF' },
            ].map((cat) => (
              <Link 
                key={cat.name}
                href={`/?category=${cat.name}`}
                style={{
                  minWidth: '100px', height: '120px', background: 'white',
                  borderRadius: '24px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                  boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#444' }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Search result info */}
        {search && (
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--color-primary-light)', borderRadius: '16px', border: '1px dashed var(--color-primary)' }}>
            <p style={{ color: 'var(--color-primary-hover)', fontWeight: 600 }}>
              🔎 Menampilkan hasil untuk: &quot;{search}&quot; ({books.length} buku ditemukan)
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
              {categoryFilter ? `Koleksi ${categoryFilter}` : 'Jelajahi Buku'}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>Pilihan terbaik untuk menemani waktu luangmu</p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select style={{ padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'white', fontWeight: 600, outline: 'none' }}>
              <option>Terbaru</option>
              <option>Harga Terendah</option>
              <option>Harga Tertinggi</option>
              <option>Rating Tertinggi</option>
            </select>
          </div>
        </div>

        {books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '32px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>📭</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Oops! Buku tidak ditemukan</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Coba gunakan kata kunci lain atau jelajahi kategori populer kami.</p>
            <Link href="/" className="btn-primary">Kembali ke Beranda</Link>
          </div>
        ) : (
          <div className="product-grid">
            {books.map((book) => {
              const avgRating = book.reviews.length > 0 
                ? book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviews.length 
                : 0;

              return (
                <Link href={`/books/${book.id}`} key={book.id} className="product-card animate-fade-in">
                  <div className="product-image-container">
                    <img src={book.imageUrl || 'https://via.placeholder.com/300x400?text=Cover+Buku'} alt={book.title} className="product-image" />
                    {book.stock <= 5 && book.stock > 0 && (
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#EF144A', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>
                        STOK TERBATAS!
                      </div>
                    )}
                    {book.stock === 0 && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                        HABIS terjual
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                        {book.category?.name || 'Umum'}
                      </span>
                      {avgRating > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>
                          ⭐ {avgRating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <h3 className="product-title" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.8rem', height: '2.8rem' }}>{book.title}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                        Rp {book.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                      <span>👤 {book.seller?.name || 'Anonim'}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Newsletter Section */}
        <div style={{
          marginTop: '6rem', background: '#1a1a1a', borderRadius: '32px',
          padding: '4rem 2rem', textAlign: 'center', color: 'white',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1rem' }}>Jangan Sampai Ketinggalan!</h2>
            <p style={{ opacity: 0.8, marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
              Dapatkan info buku terbaru dan promo eksklusif langsung di email Anda setiap minggu.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '450px', margin: '0 auto' }}>
              <input 
                type="email" 
                placeholder="Alamat email Anda..." 
                style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '12px', border: 'none', outline: 'none', fontSize: '1rem' }}
              />
              <button className="btn-primary" style={{ padding: '0 2rem' }}>Berlangganan</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  } catch (error: any) {
    console.error("Home Page Error:", error);
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '32px', marginTop: '2rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Sistem Sedang Bermasalah</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Terjadi kesalahan saat memuat halaman.</p>
        <div style={{ 
          background: '#fee2e2', color: '#b91c1c', padding: '1rem', 
          borderRadius: '12px', fontSize: '0.85rem', marginBottom: '2rem',
          maxWidth: '500px', margin: '0 auto 2rem', textAlign: 'left',
          fontFamily: 'monospace', overflowX: 'auto'
        }}>
          Error: {error.message || "Unknown error"}
        </div>
        <Link href="/" className="btn-primary">Coba Muat Ulang</Link>
      </div>
    );
  }
}
