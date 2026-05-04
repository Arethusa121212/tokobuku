"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetchCart();
  }, [session]);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart/items");
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch cart");
    } finally {
      setFetching(false);
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.book.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!address.trim()) {
      toast.error("Masukkan alamat pengiriman");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (res.ok) {
        toast.success("Pesanan berhasil dibuat! 🎉");
        router.push("/orders");
      } else {
        const data = await res.json();
        toast.error(data.message || "Gagal melakukan checkout");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        Silakan login untuk melanjutkan checkout.
      </div>
    );
  }

  if (fetching) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)' }}>
        Memuat data...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Keranjang kosong.</p>
        <button onClick={() => router.push("/")} className="btn-primary">Mulai Belanja</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
        {/* Left - Items */}
        <div>
          <div style={{ padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '20px', border: '1.5px solid var(--color-border)' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.2rem' }}>Ringkasan Pesanan</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.book.imageUrl || 'https://via.placeholder.com/60x80'} alt={item.book.title} style={{ width: '50px', height: '65px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.book.title}</div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>x{item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    Rp {(item.book.price * item.quantity).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Payment */}
        <div>
          <div style={{ padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '20px', border: '1.5px solid var(--color-border)', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.2rem' }}>Pengiriman</h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Alamat Pengiriman</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Masukkan alamat lengkap..."
                rows={3}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '10px',
                  border: '1.5px solid var(--color-border)', fontSize: '0.95rem',
                  resize: 'vertical', fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ borderTop: '1.5px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Ongkir</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Gratis</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.3rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1.5px solid var(--color-border)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-primary)' }}>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 700, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Memproses..." : "Bayar Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
