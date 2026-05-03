"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RemoveFromCartButton({ cartItemId }: { cartItemId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cart?id=${cartItemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal menghapus item dari keranjang");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRemove} 
      disabled={loading}
      style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', opacity: loading ? 0.7 : 1 }}
    >
      {loading ? "Menghapus..." : "Hapus"}
    </button>
  );
}
