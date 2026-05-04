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
        <Link href="/" className="navbar-brand">
          Toko Buku
        </Link>
        
        {session?.user?.role !== "SELLER" && (
          <form onSubmit={handleSearch} className="navbar-search" style={{ flex: 1, margin: '0 3rem', position: 'relative' }}>
            <input
              type="text"
              placeholder="Mau baca buku apa hari ini?..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '0.8rem 1.5rem', borderRadius: '12px', 
                border: '1.5px solid var(--color-border)', background: '#F8FAFC',
                fontSize: '0.95rem', transition: 'all 0.2s', outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = '0 0 0 4px var(--color-primary-light)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <span style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          </form>
        )}

        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: session?.user?.role === "SELLER" ? 'auto' : '0' }}>
          {session?.user?.role !== "SELLER" && (
            <Link href="/cart" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
              <span style={{ fontSize: '1.4rem' }}>🛒</span>
              <span style={{ fontSize: '0.9rem' }}>Keranjang</span>
            </Link>
          )}
          
          <div style={{ height: '24px', width: '1px', background: '#E2E8F0' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <Link href="/orders" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Pesanan
                </Link>

                <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', padding: '0.3rem', borderRadius: '40px', border: '1px solid var(--color-border)', background: 'white' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={session.user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + session.user.email} 
                    alt="Profile" 
                    style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <span style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '0.85rem', paddingRight: '0.8rem' }}>
                    {session.user.name?.split(' ')[0]}
                  </span>
                </Link>

                {session.user.role === "SELLER" && (
                  <Link href="/dashboard" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', boxShadow: 'none' }}>
                    Dashboard
                  </Link>
                )}
                
                <button 
                  onClick={() => {
                    signOut();
                    toast.success("Berhasil keluar");
                  }} 
                  style={{ 
                    color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' 
                  }}
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/login" style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                  Masuk
                </Link>
                <Link href="/register" className="btn-primary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}>
                  Daftar Sekarang
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
