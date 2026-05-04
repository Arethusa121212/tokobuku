"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PaymentUploadProps {
  orderId: string;
}

export default function PaymentUpload({ orderId }: PaymentUploadProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // 1. Upload image to our upload API
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Gagal mengunggah gambar");
      const { imageUrl } = await uploadRes.json();

      // 2. Update order with payment proof
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentProof: imageUrl }),
      });

      if (res.ok) {
        toast.success("Bukti bayar berhasil dikirim!");
        router.refresh();
      } else {
        toast.error("Gagal memperbarui pesanan");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat mengunggah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        style={{ display: 'none' }} 
        accept="image/*"
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="btn-primary"
        style={{ 
          padding: '0.6rem 1.2rem', fontSize: '0.9rem', 
          background: '#3b82f6', border: 'none', 
          opacity: loading ? 0.7 : 1 
        }}
      >
        {loading ? "Mengunggah..." : "📤 Unggah Bukti Bayar"}
      </button>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.4rem' }}>
        Transfer ke Rek BCA: 1234567890 a/n Tokobuku
      </p>
    </div>
  );
}
