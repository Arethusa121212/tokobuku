import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import OrderStatusActions from "@/components/OrderStatusActions";

export const dynamic = "force-dynamic";

export default async function DashboardOrdersPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    console.error("Session fetch failed", e);
  }

  if (!session || !session.user || session.user.role !== "SELLER") {
    redirect("/login");
  }

  // Get seller's book IDs
  const sellerBooks = await prisma.book.findMany({
    where: { sellerId: session.user.id },
    select: { id: true },
  });
  const bookIds = sellerBooks.map((b) => b.id);

  // Get orders that contain seller's books
  const orderItems = await prisma.orderItem.findMany({
    where: { bookId: { in: bookIds } },
    include: {
      book: true,
      order: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  });

  // Group by order
  const ordersMap = new Map<string, any>();
  orderItems.forEach((item) => {
    if (!ordersMap.has(item.orderId)) {
      ordersMap.set(item.orderId, {
        ...item.order,
        sellerItems: [],
      });
    }
    ordersMap.get(item.orderId).sellerItems.push(item);
  });
  const orders = Array.from(ordersMap.values());

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING": return { bg: '#fef3c7', color: '#b45309', label: '⏳ Menunggu Pembayaran' };
      case "PROCESSING": return { bg: '#dbeafe', color: '#1d4ed8', label: '📦 Perlu Verifikasi' };
      case "SHIPPED": return { bg: '#e0e7ff', color: '#4338ca', label: '🚚 Sedang Dikirim' };
      case "DELIVERED": return { bg: '#dcfce7', color: '#15803d', label: '✅ Selesai' };
      default: return { bg: '#f1f5f9', color: '#475569', label: status };
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Pesanan Masuk</h1>
        <Link href="/dashboard" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>← Kembali</Link>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--color-surface)', borderRadius: '20px', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
          <p>Belum ada pesanan masuk.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order: any) => {
            const statusInfo = getStatusStyle(order.status);
            const sellerTotal = order.sellerItems.reduce((a: number, i: any) => a + i.price * i.quantity, 0);
            return (
              <div key={order.id} style={{ background: 'var(--color-surface)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <div style={{ padding: '1rem 1.5rem', background: 'var(--color-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>#{order.id.slice(-8).toUpperCase()}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginLeft: '1rem' }}>
                      oleh {order.user.name || order.user.email}
                    </span>
                  </div>
                  <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, background: statusInfo.bg, color: statusInfo.color }}>
                    {statusInfo.label}
                  </span>
                </div>
                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 200px', gap: '2rem' }}>
                  <div>
                    {order.sellerItems.map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                        <span>{item.book.title} x{item.quantity}</span>
                        <span style={{ fontWeight: 600 }}>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.8rem', textAlign: 'right', fontWeight: 800, color: 'var(--color-primary)' }}>
                      Total Pendapatan: Rp {sellerTotal.toLocaleString('id-ID')}
                    </div>
                    
                    <OrderStatusActions orderId={order.id} currentStatus={order.status} />
                  </div>

                  {/* Payment Proof Column */}
                  <div style={{ textAlign: 'center', borderLeft: '1px solid var(--color-border)', paddingLeft: '1.5rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>BUKTI BAYAR</p>
                    {order.paymentProof ? (
                      <a href={order.paymentProof} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={order.paymentProof} alt="Bukti Bayar" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--color-border)', cursor: 'zoom-in' }} />
                      </a>
                    ) : (
                      <div style={{ padding: '2rem 1rem', background: '#f9fafb', borderRadius: '8px', color: '#9ca3af', fontSize: '0.8rem' }}>
                        Belum ada bukti
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
