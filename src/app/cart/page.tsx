import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import RemoveFromCartButton from "@/components/RemoveFromCartButton";
import CartItemInteraction from "@/components/CartItemInteraction";

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { book: true },
    orderBy: { id: 'asc' }
  });

  const total = cartItems.reduce((acc, item) => acc + (item.book.price * item.quantity), 0);

  return (
    <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2.5rem', textAlign: 'center' }}>Keranjang Belanja</h1>
      
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--color-surface)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
          <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>Keranjang belanja Anda masih kosong.</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', padding: '0.8rem 2rem' }}>Mulai Belanja</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', alignItems: 'center', border: '1.5px solid var(--color-border)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.book.imageUrl || 'https://via.placeholder.com/150x200?text=Cover+Buku'} alt={item.book.title} style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '12px' }} />
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>{item.book.title}</h3>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '1.1rem' }}>Rp {item.book.price.toLocaleString('id-ID')}</div>
                  <div style={{ marginTop: '0.8rem' }}>
                    <CartItemInteraction cartItemId={item.id} initialQuantity={item.quantity} />
                  </div>
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
