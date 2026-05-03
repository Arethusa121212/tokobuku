"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface CartItemInteractionProps {
  cartItemId: string;
  initialQuantity: number;
}

export default function CartItemInteraction({ cartItemId, initialQuantity }: CartItemInteractionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateQuantity = async (newQuantity: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity: newQuantity }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        toast.error("Gagal memperbarui jumlah");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '10px' }}>
      <button 
        onClick={() => updateQuantity(initialQuantity - 1)}
        disabled={loading}
        style={{ 
          background: 'white', border: '1px solid #e2e8f0', width: '28px', height: '28px', 
          borderRadius: '6px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}
      >-</button>
      <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{initialQuantity}</span>
      <button 
        onClick={() => updateQuantity(initialQuantity + 1)}
        disabled={loading}
        style={{ 
          background: 'white', border: '1px solid #e2e8f0', width: '28px', height: '28px', 
          borderRadius: '6px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}
      >+</button>
    </div>
  );
}
