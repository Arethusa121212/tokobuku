import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookInteraction from "@/components/BookInteraction";
import ReviewSection from "@/components/ReviewSection";

export default async function BookDetail({ params }: { params: any }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const session = await getServerSession(authOptions);
  if (session?.user?.role === "SELLER") {
    const { redirect } = await import("next/navigation");
    redirect("/dashboard");
  }

  const book = await prisma.book.findUnique({
    where: { id },
    include: { 
      seller: { select: { id: true, name: true } },
      category: true,
      reviews: { select: { rating: true } }
    }
  });

  if (!book) {
    notFound();
  }

  const avgRating = book.reviews.length > 0 
    ? book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviews.length 
    : 0;

  let isWishlisted = false;
  if (session?.user) {
    try {
      const wish = await prisma.wishlist.findFirst({
        where: {
          userId: session.user.id,
          bookId: book.id
        }
      });
      isWishlisted = !!wish;
    } catch (e) {
      console.error("Wishlist check failed", e);
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', background: 'var(--color-surface)', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={book.imageUrl || 'https://via.placeholder.com/400x500?text=Cover+Buku'} 
            alt={book.title} 
            style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', aspectRatio: '3/4', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              {book.category && (
                <span style={{
                  fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)',
                  background: '#f0fdf4', padding: '0.3rem 0.8rem', borderRadius: '10px',
                }}>
                  {book.category.name}
                </span>
              )}
              {avgRating > 0 && (
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  ⭐ {avgRating.toFixed(1)} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>({book.reviews.length} ulasan)</span>
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.5rem', lineHeight: 1.2 }}>{book.title}</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', margin: 0 }}>
                Penjual: 
                <Link href={`/store/${book.seller?.id}`} style={{ color: 'var(--color-primary)', fontWeight: 700, marginLeft: '0.4rem', textDecoration: 'none' }} className="seller-link">
                  {book.seller?.name || 'Anonim'}
                </Link>
              </p>
              <div style={{ 
                padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700,
                background: book.stock > 0 ? '#dcfce7' : '#fee2e2',
                color: book.stock > 0 ? '#15803d' : '#b91c1c'
              }}>
                Stok: {book.stock}
              </div>
            </div>
          </div>
          
          <div style={{ padding: '1.5rem', background: 'var(--color-bg)', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Deskripsi Buku</h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{book.description}</p>
          </div>
          
          <div style={{ marginTop: 'auto' }}>
            {session?.user?.role !== "SELLER" ? (
              <BookInteraction 
                bookId={book.id} 
                price={book.price} 
                stock={book.stock} 
                isWishlistedInitial={isWishlisted} 
                sellerId={book.sellerId}
                sellerName={book.seller?.name || 'Penjual'}
                bookTitle={book.title}
                bookImage={book.imageUrl || ''}
              />
            ) : (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
                Akun Penjual tidak dapat melakukan pembelian.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: '2rem', background: 'var(--color-surface)', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <ReviewSection bookId={book.id} />
      </div>
    </div>
  );
}
