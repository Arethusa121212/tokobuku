"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface BookInteractionProps {
  bookId: string;
  price: number;
  stock: number;
  isWishlistedInitial: boolean;
}

export default function BookInteraction({ bookId, price, stock, isWishlistedInitial }: BookInteractionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(isWishlistedInitial);
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const totalPrice = price * quantity;

  const handleQuantityChange = (type: "inc" | "dec") => {
    if (type === "inc" && quantity < stock) {
      setQuantity(quantity + 1);
    } else if (type === "dec" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const toggleWishlist = async () => {
    if (!session) {
      toast.error("Silakan login untuk menambah ke wishlist");
      router.push("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsWishlisted(data.active);
        toast.success(data.message, { icon: data.active ? '❤️' : '💔' });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Gagal mengubah wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleCartAction = async (redirect = false) => {
    if (!session) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, quantity }),
      });

      if (res.ok) {
        toast.success(redirect ? "Memproses pesanan..." : "🛒 Berhasil masuk keranjang!");
        if (redirect) {
          router.push("/cart");
        }
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  if (stock === 0) {
    return (
      <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '12px', textAlign: 'center', fontWeight: 700 }}>
        Maaf, Stok Habis
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Quantity Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--color-bg)', borderRadius: '12px', border: '1.5px solid var(--color-border)' }}>
        <div style={{ fontWeight: 600 }}>Jumlah</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => handleQuantityChange("dec")}
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--color-border)', background: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 800 }}
          >-</button>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
          <button 
            onClick={() => handleQuantityChange("inc")}
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--color-border)', background: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 800 }}
          >+</button>
        </div>
      </div>

      {/* Total Price & Wishlist */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>Subtotal</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Rp {totalPrice.toLocaleString('id-ID')}
          </div>
        </div>
        
        <button 
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          style={{ 
            width: '50px', height: '50px', borderRadius: '50%', 
            border: '1.5px solid var(--color-border)', 
            background: isWishlisted ? '#fee2e2' : 'white',
            cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
            fontSize: '1.5rem', transition: 'all 0.2s',
            color: isWishlisted ? '#ef4444' : '#94a3b8'
          }}
        >
          {isWishlisted ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <button 
          onClick={() => handleCartAction(false)}
          disabled={loading}
          style={{ 
            padding: '1rem', borderRadius: '12px', border: '2px solid var(--color-primary)', 
            background: 'transparent', color: 'var(--color-primary)', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          + Keranjang
        </button>
        <button 
          onClick={() => handleCartAction(true)}
          disabled={loading}
          className="btn-primary"
          style={{ padding: '1rem', borderRadius: '12px', border: 'none', fontWeight: 700 }}
        >
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}
