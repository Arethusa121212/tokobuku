"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Status diperbarui ke ${newStatus}`);
        router.refresh();
      } else {
        toast.error("Gagal memperbarui status");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === "DELIVERED" || currentStatus === "CANCELLED") return null;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
      {currentStatus === "PROCESSING" && (
        <button 
          onClick={() => updateStatus("SHIPPED")} 
          disabled={loading}
          style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: '#4338ca', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}
        >
          🚚 Kirim Barang
        </button>
      )}
      {currentStatus === "SHIPPED" && (
        <button 
          onClick={() => updateStatus("DELIVERED")} 
          disabled={loading}
          style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: '#15803d', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}
        >
          ✅ Selesai
        </button>
      )}
      {(currentStatus === "PENDING" || currentStatus === "PROCESSING") && (
        <button 
          onClick={() => updateStatus("CANCELLED")} 
          disabled={loading}
          style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}
        >
          ❌ Batalkan
        </button>
      )}
    </div>
  );
}
