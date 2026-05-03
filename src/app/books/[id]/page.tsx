import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

export default async function BookDetail({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const book = await prisma.book.findUnique({
    where: { id: resolvedParams.id },
    include: { seller: { select: { name: true } } }
  });

  if (!book) {
    notFound();
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', background: 'var(--color-surface)', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={book.imageUrl || 'https://via.placeholder.com/400x500?text=Cover+Buku'} 
          alt={book.title} 
          style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', aspectRatio: '3/4' }} 
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.5rem', lineHeight: 1.2 }}>{book.title}</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Penjual: <span style={{ fontWeight: 600 }}>{book.seller?.name || 'Anonim'}</span></p>
        </div>
        
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          Rp {book.price.toLocaleString('id-ID')}
        </div>
        
        <div style={{ padding: '1.5rem', background: 'var(--color-bg)', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Deskripsi Buku</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{book.description}</p>
        </div>
        
        <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
          <AddToCartButton bookId={book.id} stock={book.stock} />
        </div>
      </div>
    </div>
  );
}
