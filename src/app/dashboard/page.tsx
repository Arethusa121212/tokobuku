import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteBookButton from "./DeleteBookButton";

export default async function DashboardPage() {
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
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Dashboard Penjual</h1>
        <Link href="/dashboard/new" className="btn-primary">
          + Tambah Buku
        </Link>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 600 }}>Koleksi Buku Anda</h2>
        
        {books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
            Anda belum menambahkan buku satupun.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>Judul Buku</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>Harga</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>Stok</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{book.title}</td>
                  <td style={{ padding: '1rem' }}>Rp {book.price.toLocaleString('id-ID')}</td>
                  <td style={{ padding: '1rem' }}>{book.stock}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <DeleteBookButton bookId={book.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
