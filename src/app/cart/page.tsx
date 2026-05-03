import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import RemoveFromCartButton from "@/components/RemoveFromCartButton";

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { book: true }
  });

  const total = cartItems.reduce((acc, item) => acc + (item.book.price * item.quantity), 0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Keranjang Belanja</h1>
      
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: '12px', color: 'var(--color-text-secondary)' }}>
          <p style={{ marginBottom: '1rem' }}>Keranjang belanja Anda masih kosong.</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block' }}>Mulai Belanja</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', alignItems: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.book.imageUrl || 'https://via.placeholder.com/150x200?text=Cover+Buku'} alt={item.book.title} style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '8px' }} />
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{item.book.title}</h3>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Rp {item.book.price.toLocaleString('id-ID')}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Kuantitas: {item.quantity}</div>
                </div>
                
                <div>
                  <RemoveFromCartButton cartItemId={item.id} />
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ padding: '2rem', background: 'var(--color-surface)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Total Belanja</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Rp {total.toLocaleString('id-ID')}</div>
            </div>
            <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
