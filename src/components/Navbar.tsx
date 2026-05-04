"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ChatWidget from "./ChatWidget";
import { pusherClient } from "@/lib/pusher-client";


export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial unread count
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/chat/rooms");
        if (res.ok) {
          const data = await res.json();
          const total = data.unreadCounts.reduce((acc: number, c: any) => acc + c.count, 0);
          setUnreadCount(total);
        }
      } catch (err) {
        console.error("Failed to fetch unread count");
      }
    };

    fetchUnread();

    // Listen for real-time notifications
    if (pusherClient) {
      const channel = pusherClient.subscribe(`user-${session.user.id}`);
      channel.bind("new-notification", () => {
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        pusherClient.unsubscribe(`user-${session.user.id}`);
      };
    }
  }, [session?.user?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        height: '80px', // Fixed height for better control
        padding: '0 1.5rem' 
      }}>
        <Link href="/" className="navbar-brand" style={{ fontSize: '1.6rem', marginBottom: '0' }}>
          Toko Buku
        </Link>
        
        {session?.user?.role !== "SELLER" && (
          <form onSubmit={handleSearch} className="navbar-search" style={{ flex: 1, margin: '0 3rem', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Cari buku..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '0.75rem 1.2rem', borderRadius: '14px', 
                border: '1.5px solid var(--color-border)', background: '#F8FAFC',
                fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s'
              }}
            />
          </form>
        )}

        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginLeft: session?.user?.role === "SELLER" ? 'auto' : '0' }}>
          {session && session.user.role !== "SELLER" && (
            <div 
              onClick={() => {
                const event = new CustomEvent("openChat", { 
                  detail: { sellerId: 'all', sellerName: 'Pesan' } 
                });
                window.dispatchEvent(event);
              }}
              style={{ 
                position: 'relative', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                padding: '0.5rem',
                borderRadius: '12px',
                transition: 'background 0.2s'
              }}
              className="nav-icon-btn"
            >
              <span style={{ fontSize: '1.5rem' }}>💬</span>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '0', right: '0',
                  background: '#EF144A', color: 'white', borderRadius: '50%',
                  width: '20px', height: '20px', fontSize: '0.7rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
          )}

          {session?.user?.role !== "SELLER" && (
            <Link href="/cart" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🛒</span>
              <span className="nav-label" style={{ fontSize: '0.9rem' }}>Keranjang</span>
            </Link>
          )}
          
          <div className="nav-divider" style={{ height: '24px', width: '1.5px', background: '#E2E8F0', margin: '0 0.5rem' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <Link href="/orders" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span className="nav-label">Pesanan</span>
                </Link>

                <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
                  <img 
                    src={session.user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + session.user.email} 
                    alt="Profile" 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0 0 0 1.5px var(--color-border)' }} 
                  />
                  {session.user.name && (
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '0.9rem' }} className="nav-label">
                      {session.user.name}
                    </span>
                  )}
                </Link>

                <button 
                  onClick={() => signOut()} 
                  style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem 0.8rem', borderRadius: '8px' }}
                  className="nav-label"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Link href="/login" style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                  Masuk
                </Link>
                <Link href="/register" className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
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

