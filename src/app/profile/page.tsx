"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      setName(u.name || "");
      setImage(u.image || "");
      setBankName(u.bankName || "");
      setAccountNumber(u.accountNumber || "");
      setAccountHolder(u.accountHolder || "");
      
      if (u.role === "SELLER") {
        fetchSalesHistory();
      } else {
        fetchWishlist();
      }
    }
  }, [session]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist");
    } finally {
      setDataLoading(false);
    }
  };

  const fetchSalesHistory = async () => {
    try {
      const res = await fetch("/api/user/sales-history");
      if (res.ok) {
        const data = await res.json();
        setSalesHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch sales history");
    } finally {
      setDataLoading(false);
    }
  };

  const handleRemoveWishlist = async (bookId: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      if (res.ok) {
        setWishlist(wishlist.filter(item => item.bookId !== bookId));
        toast.success("Dihapus dari wishlist");
      }
    } catch (err) {
      toast.error("Gagal menghapus");
    }
  };

  if (!session) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Silakan login untuk melihat profil.</div>;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImage(data.imageUrl);
        toast.success("Foto berhasil diunggah!");
      } else {
        toast.error(data.message || "Gagal mengunggah foto");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat mengunggah");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image, bankName, accountNumber, accountHolder }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profil berhasil diperbarui!");
        // Update session client-side
        await update({ name, image, bankName, accountNumber, accountHolder });
        router.refresh();
      } else {
        toast.error(data.message || "Gagal memperbarui profil");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const isSeller = session.user.role === "SELLER";

  return (
    <div style={{ maxWidth: '1000px', margin: '4rem auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', padding: '0 1rem' }}>
      {/* Profile Settings */}
      <div style={{ padding: '2.5rem', background: 'var(--color-surface)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', height: 'fit-content' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Pengaturan Profil</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <img 
                src={image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + session.user.email} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
              />
              <label style={{ 
                position: 'absolute', bottom: '0', right: '0', 
                background: 'var(--color-primary)', color: 'white', 
                width: '30px', height: '30px', borderRadius: '50%', 
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                fontSize: '1rem'
              }}>
                📷
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                {isSeller ? "Nama Toko" : "Nama Lengkap"}
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid var(--color-border)', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>Email</label>
              <input type="email" value={session.user.email || ""} disabled style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid var(--color-border)', fontSize: '0.95rem', background: '#f8fafc', color: '#64748b' }} />
            </div>

            {isSeller && (
              <div style={{ display: 'grid', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--color-border)', marginTop: '0.5rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>💳 Informasi Rekening</p>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.8rem' }}>Nama Bank</label>
                  <input 
                    type="text" 
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="BCA, Mandiri, dll"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid var(--color-border)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.8rem' }}>Nomor Rekening</label>
                  <input 
                    type="text" 
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid var(--color-border)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.8rem' }}>Atas Nama</label>
                  <input 
                    type="text" 
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="Nama sesuai buku tabungan"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1.5px solid var(--color-border)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading || uploading} className="btn-primary" style={{ padding: '0.9rem', fontSize: '1rem', fontWeight: 700 }}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      {/* Conditional Section: Wishlist for Customer, Inbox & Sales History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Inbox Spot for Buyers */}
        {!isSeller && (
          <Link href="/messages" style={{ textDecoration: 'none' }}>
            <div style={{ 
              padding: '2rem', background: 'var(--color-primary)', borderRadius: '24px', 
              boxShadow: '0 10px 30px rgba(0,170,91,0.2)', color: 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>Kotak Masuk</h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Lihat pesan dari penjual buku Anda</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>💬</span>
                <span style={{ 
                  background: 'white', color: 'var(--color-primary)', 
                  fontWeight: 900, padding: '0.4rem 1rem', borderRadius: '12px',
                  fontSize: '1.2rem'
                }}>
                  ➔
                </span>
              </div>
            </div>
          </Link>
        )}

        <div style={{ padding: '2.5rem', background: 'var(--color-surface)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isSeller ? (
              <><span style={{ color: 'var(--color-primary)' }}>💹</span> Penjualan Berhasil</>
            ) : (
              <><span>❤️</span> Wishlist Saya</>
            )}
          </div>

        </h2>

        {dataLoading ? (
          <p>Memuat data...</p>
        ) : isSeller ? (
          salesHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)', background: 'var(--color-bg)', borderRadius: '16px' }}>
              <p>Belum ada penjualan yang selesai.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {salesHistory.map((sale) => (
                <div key={sale.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: '16px', border: '1.5px solid var(--color-border)' }}>
                  <img src={sale.book.imageUrl || 'https://via.placeholder.com/60x80'} alt={sale.book.title} style={{ width: '50px', height: '70px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sale.book.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Oleh: {sale.order.user.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem' }}>
                      <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem' }}>Rp {(sale.price * sale.quantity).toLocaleString('id-ID')}</div>
                      <span style={{ 
                        fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '10px', 
                        background: sale.order.status === 'DELIVERED' ? '#dcfce7' : '#e0e7ff',
                        color: sale.order.status === 'DELIVERED' ? '#15803d' : '#4338ca',
                        fontWeight: 700
                      }}>
                        {sale.order.status === 'DELIVERED' ? 'Selesai' : 'Sedang Dikirim'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)', background: 'var(--color-bg)', borderRadius: '16px' }}>
              <p>Belum ada buku di wishlist.</p>
              <Link href="/" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem', marginTop: '1rem', display: 'inline-block' }}>Cari Buku</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {wishlist.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: '16px', position: 'relative', border: '1.5px solid var(--color-border)' }}>
                  <img src={item.book.imageUrl || 'https://via.placeholder.com/60x80'} alt={item.book.title} style={{ width: '60px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <Link href={`/books/${item.bookId}`} style={{ textDecoration: 'none', color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '1rem', display: 'block', marginBottom: '0.2rem' }}>
                      {item.book.title}
                    </Link>
                    <div style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Rp {item.book.price.toLocaleString('id-ID')}</div>
                  </div>
                  <button 
                    onClick={() => handleRemoveWishlist(item.bookId)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  </div>
);
}



