"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ bookId, stock }: { bookId: string, stock: number }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!session) {
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
        alert("Buku berhasil ditambahkan ke keranjang!");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal menambahkan ke keranjang");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
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
