import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import BookInteraction from "@/components/BookInteraction";

export default async function BookDetail({ params }: { params: any }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Safe session fetch
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    console.error("Session fetch failed", e);
  }

  const book = await prisma.book.findUnique({
    where: { id },
    include: { 
      seller: { select: { name: true } },
    }
  });

  if (!book) {
    notFound();
  }

  let isWishlisted = false;
  if (session?.user) {
    try {
      const wish = await prisma.wishlist.findUnique({
        where: {
          userId_bookId: {
            userId: session.user.id,
            bookId: book.id
          }
        }
      });
      isWishlisted = !!wish;
    } catch (e) {
      console.error("Wishlist check failed", e);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', background: 'var(--color-surface)', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={book.imageUrl || 'https://via.placeholder.com/400x500?text=Cover+Buku'} 
          alt={book.title} 
          style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', aspectRatio: '3/4', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} 
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.5rem', lineHeight: 1.2 }}>{book.title}</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Penjual: <span style={{ fontWeight: 600 }}>{book.seller?.name || 'Anonim'}</span></p>
        </div>
        
        <div style={{ padding: '1.5rem', background: 'var(--color-bg)', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Deskripsi Buku</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{book.description}</p>
        </div>
        
        <div style={{ marginTop: 'auto' }}>
          <BookInteraction 
            bookId={book.id} 
            price={book.price} 
            stock={book.stock} 
            isWishlistedInitial={isWishlisted} 
          />
        </div>
      </div>
    </div>
  );
}
