"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddToCartButton({ bookId, stock }: { bookId: string, stock: number }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
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
        body: JSON.stringify({ bookId }),
      });

      if (res.ok) {
        toast.success("🛒 Berhasil ditambahkan ke keranjang!", {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Gagal menambahkan ke keranjang");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  if (stock === 0) {
    return <button disabled style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: '#e5e7eb', color: '#9ca3af', fontWeight: 600, cursor: 'not-allowed' }}>Stok Habis</button>;
  }

  return (
    <button 
      onClick={handleAddToCart} 
      disabled={loading}
      className="btn-primary" 
      style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}
    >
      {loading ? "Menambahkan..." : "Tambah ke Keranjang"}
    </button>
  );
}
