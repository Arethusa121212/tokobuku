"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
        <Link href="/" className="navbar-brand" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          Toko Buku
        </Link>
        
        <div className="navbar-search" style={{ flex: 1, margin: '0 2rem' }}>
          <input type="text" placeholder="Cari buku apa hari ini?" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
        </div>

        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/cart" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
            🛒 Keranjang
          </Link>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {session ? (
              <>
                {session.user.role === "SELLER" && (
                  <Link href="/dashboard" style={{ padding: '0.5rem 1rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                    Dashboard
                  </Link>
                )}
                <button onClick={() => signOut()} style={{ padding: '0.5rem 1rem', color: '#ef4444', fontWeight: 600, border: '1px solid #ef4444', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}>
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ padding: '0.5rem 1rem', color: 'var(--color-primary)', fontWeight: 600, border: '1px solid var(--color-primary)', borderRadius: '8px', textDecoration: 'none' }}>
                  Masuk
                </Link>
                <Link href="/register" className="btn-primary" style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)', color: 'white', fontWeight: 600, borderRadius: '8px', textDecoration: 'none' }}>
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
