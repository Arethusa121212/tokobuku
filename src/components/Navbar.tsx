"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0' }}>
        <Link href="/" className="navbar-brand" style={{ fontSize: '1.4rem' }}>
          Toko Buku
        </Link>
        
        {session?.user?.role !== "SELLER" && (
          <form onSubmit={handleSearch} className="navbar-search" style={{ flex: 1, margin: '0 3rem', position: 'relative' }}>
            <input
              type="text"
              placeholder="Cari buku..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '0.7rem 1.2rem', borderRadius: '12px', 
                border: '1.5px solid var(--color-border)', background: '#F8FAFC',
                fontSize: '0.9rem', outline: 'none'
              }}
            />
          </form>
        )}

        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: session?.user?.role === "SELLER" ? 'auto' : '0' }}>
          {session?.user?.role !== "SELLER" && (
            <Link href="/cart" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🛒</span>
              <span className="nav-label" style={{ fontSize: '0.85rem' }}>Keranjang</span>
            </Link>
          )}
          
          <div className="nav-divider" style={{ height: '20px', width: '1px', background: '#E2E8F0' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Link href="/orders" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                  <span className="nav-label">Pesanan</span>
                  <span className="nav-icon-mobile" style={{ display: 'none', fontSize: '1.3rem' }}>📦</span>
                </Link>

                <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={session.user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + session.user.email} 
                    alt="Profile" 
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-border)' }} 
                  />
                  {session.user.name && (
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '0.85rem' }} className="nav-label">
                      {session.user.name}
                    </span>
                  )}
                </Link>

                <button 
                  onClick={() => signOut()} 
                  style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.8rem' }}
                  className="nav-label"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link href="/login" style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                  Masuk
                </Link>
                <Link href="/register" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </nav>
  );
}
