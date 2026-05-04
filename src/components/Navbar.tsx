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
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
        <Link href="/" className="navbar-brand" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          Toko Buku
        </Link>
        
        <form onSubmit={handleSearch} className="navbar-search" style={{ flex: 1, margin: '0 2rem' }}>
          <input
            type="text"
            placeholder="Cari buku apa hari ini?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
        </form>

        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/cart" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🛒</span> Keranjang
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/orders" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                  📦 Pesanan
                </Link>

                <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', padding: '0.4rem 0.8rem', borderRadius: '30px', border: '1.5px solid var(--color-border)', transition: 'all 0.2s' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={session.user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + session.user.email} 
                    alt="Profile" 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <span style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                    {session.user.name?.split(' ')[0]}
                  </span>
                </Link>

                {session.user.role === "SELLER" && (
                  <Link href="/dashboard" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
                    Dashboard
                  </Link>
                )}
                
                <button 
                  onClick={() => {
                    signOut();
                    toast.success("Berhasil keluar");
                  }} 
                  style={{ 
                    padding: '0.5rem 1rem', color: '#ef4444', fontWeight: 600, 
                    border: '1.5px solid #ef4444', borderRadius: '8px', 
                    background: 'transparent', cursor: 'pointer', fontSize: '0.85rem' 
                  }}
                >
                  Keluar
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" style={{ padding: '0.5rem 1rem', color: 'var(--color-primary)', fontWeight: 600, border: '1.5px solid var(--color-primary)', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Masuk
                </Link>
                <Link href="/register" className="btn-primary" style={{ padding: '0.6rem 1.2rem', background: 'var(--color-primary)', color: 'white', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
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
