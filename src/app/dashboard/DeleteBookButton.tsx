"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteBookButton({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus buku ini?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/books?id=${bookId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal menghapus buku");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
    >
      {loading ? "Menghapus..." : "Hapus"}
    </button>
  );
}
