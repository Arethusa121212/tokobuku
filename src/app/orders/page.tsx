import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PaymentUpload from "@/components/PaymentUpload";
import OrderRatingButton from "@/components/OrderRatingButton";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    console.error("Session fetch failed", e);
  }

  if (!session || !session.user) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { 
          book: {
            include: { seller: { select: { name: true, bankName: true, accountNumber: true, accountHolder: true } } }
          }
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return { bg: '#fef3c7', color: '#b45309', label: '⏳ Menunggu Pembayaran' };
      case "PROCESSING":
        return { bg: '#dbeafe', color: '#1d4ed8', label: '📦 Sedang Diverifikasi' };
      case "SHIPPED":
        return { bg: '#e0e7ff', color: '#4338ca', label: '🚚 Sedang Dikirim' };
      case "DELIVERED":
        return { bg: '#dcfce7', color: '#15803d', label: '✅ Selesai' };
      case "CANCELLED":
        return { bg: '#fee2e2', color: '#b91c1c', label: '❌ Dibatalkan' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: status };
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Pesanan Saya</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--color-surface)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</p>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Belum ada pesanan.</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', padding: '0.8rem 2rem' }}>Mulai Belanja</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => {
            const statusInfo = getStatusStyle(order.status);
            
            // Collect unique sellers for this order
            const sellersMap = new Map();
            order.items.forEach(i => sellersMap.set(i.book.seller.name, i.book.seller));
            const sellers = Array.from(sellersMap.values());

            return (
              <div key={order.id} style={{ background: 'var(--color-surface)', borderRadius: '20px', overflow: 'hidden', border: '1.5px solid var(--color-border)' }}>
                {/* Order Header */}
                <div style={{ padding: '1.2rem 1.5rem', background: 'var(--color-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Order #{order.id.slice(-8).toUpperCase()}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginLeft: '1rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <span style={{
                    padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                    background: statusInfo.bg, color: statusInfo.color
                  }}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Order Items */}
                <div style={{ padding: '1.5rem' }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.book.imageUrl || 'https://via.placeholder.com/50x65'} alt={item.book.title} style={{ width: '50px', height: '65px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{item.book.title}</div>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                          {item.quantity}x @ Rp {item.price.toLocaleString('id-ID')} 
                          <span style={{ marginLeft: '0.5rem', fontStyle: 'italic', fontSize: '0.8rem' }}>(Penjual: {item.book.seller.name})</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                        <div style={{ fontWeight: 700 }}>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</div>
                        {order.status === "DELIVERED" && (
                          <OrderRatingButton bookId={item.bookId} bookTitle={item.book.title} />
                        )}
                      </div>
                    </div>
                  ))}

                  <div style={{ borderTop: '1.5px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      {order.address && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                          📍 Alamat: {order.address}
                        </div>
                      )}
                      
                      {order.status === "PENDING" && (
                        <div style={{ marginBottom: '1.5rem', padding: '1.2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <p style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>💳</span> Instruksi Pembayaran:
                          </p>
                          {sellers.map((seller: any, idx) => (
                            <div key={idx} style={{ 
                              padding: '1rem', background: 'white', borderRadius: '10px', 
                              border: '1px solid #f1f5f9', marginBottom: idx === sellers.length - 1 ? '1rem' : '0.8rem' 
                            }}>
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>Transfer ke Penjual: <strong>{seller.name}</strong></div>
                              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.2rem', fontSize: '0.85rem' }}>
                                <span style={{ color: '#64748b' }}>Bank:</span>
                                <span style={{ fontWeight: 700 }}>{seller.bankName || "-"}</span>
                                <span style={{ color: '#64748b' }}>No. Rek:</span>
                                <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.05rem' }}>{seller.accountNumber || "-"}</span>
                                <span style={{ color: '#64748b' }}>A/N:</span>
                                <span style={{ fontWeight: 700 }}>{seller.accountHolder || "-"}</span>
                              </div>
                            </div>
                          ))}
                          <PaymentUpload orderId={order.id} />
                        </div>
                      )}

                      {order.paymentProof && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                          ✅ Bukti bayar sudah diunggah
                        </div>
                      )}
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                      Total: Rp {order.totalAmount.toLocaleString('id-ID')}
                    </div>
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
