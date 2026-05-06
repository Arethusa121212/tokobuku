import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteBookButton from "./DeleteBookButton";
import EditBookButton from "./EditBookButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      redirect("/login");
    }

    if (session.user.role !== "SELLER") {
      return (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Akses Ditolak</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Halaman ini hanya untuk Penjual (Seller).</p>
          <Link href="/" style={{ color: 'var(--color-primary)', marginTop: '1rem', display: 'inline-block' }}>Kembali ke Beranda</Link>
        </div>
      );
    }

    const books = await prisma.book.findMany({
      where: { sellerId: session.user.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    // Stats
    const totalBooks = books.length;
    const totalStock = books.reduce((acc, b) => acc + (b.stock || 0), 0);

    // Get orders for seller's books
    const sellerBookIds = books.map(b => b.id);
    const orderItems = sellerBookIds.length > 0 
      ? await prisma.orderItem.findMany({
          where: { bookId: { in: sellerBookIds } },
        })
      : [];
    
    const totalRevenue = orderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const totalOrders = new Set(orderItems.map(i => i.orderId)).size;

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    return (
      <div style={{ paddingTop: '2rem' }}>
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', 
          marginBottom: '3.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)'
        }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Dashboard Penjual</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Kelola toko, pesanan, dan pesan Anda di sini.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/messages" className="dashboard-link-blue">
              💬 Pesan Masuk
            </Link>
            <Link href="/dashboard/settings" className="dashboard-link-gray">
              ⚙️ Pengaturan Toko
            </Link>
            <Link href="/dashboard/orders" className="dashboard-link-primary">
              📦 Pesanan Masuk
            </Link>
            <Link href="/dashboard/new" className="btn-primary" style={{ padding: '0.8rem 1.6rem', borderRadius: '12px' }}>
              + Tambah Buku
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Buku', value: totalBooks, icon: '📚', color: '#3b82f6' },
            { label: 'Total Stok', value: totalStock, icon: '📦', color: '#8b5cf6' },
            { label: 'Pesanan', value: totalOrders, icon: '🛒', color: '#f59e0b' },
            { label: 'Pendapatan', value: `Rp ${totalRevenue.toLocaleString()}`, icon: '💰', color: '#00AA5B' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '16px',
              border: '1.5px solid var(--color-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 600 }}>Koleksi Buku Anda</h2>
          
          {books.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
              Anda belum menambahkan buku satupun.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>Judul Buku</th>
                    <th style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>Kategori</th>
                    <th style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>Harga</th>
                    <th style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>Stok</th>
                    <th style={{ padding: '1rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{book.title}</td>
                      <td style={{ padding: '1rem' }}>
                        {book.category ? (
                          <span style={{ background: '#f0fdf4', color: 'var(--color-primary)', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600 }}>
                            {book.category.name}
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '1rem' }}>Rp {book.price.toLocaleString()}</td>
                      <td style={{ padding: '1rem' }}>{book.stock}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <EditBookButton book={book} categories={categories} />
                        <DeleteBookButton bookId={book.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error: any) {
    console.error("Dashboard Error:", error);
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h1 style={{ color: '#ef4444' }}>Terjadi Kesalahan di Dashboard</h1>
        <p style={{ marginTop: '1rem' }}>{error.message || "Kesalahan tidak dikenal"}</p>
        <Link href="/" style={{ marginTop: '2rem', display: 'inline-block', color: 'var(--color-primary)' }}>Kembali ke Beranda</Link>
      </div>
    );
  }
}

