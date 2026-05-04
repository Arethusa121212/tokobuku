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
  const [bankAccount, setBankAccount] = useState("");
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
      setBankAccount((session.user as any).bankAccount || "");
      fetchWishlist();
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
      setWishlistLoading(false);
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
        body: JSON.stringify({ name, image, bankAccount }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profil berhasil diperbarui!");
        // Update session client-side
        await update({ name, image, bankAccount });
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
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>Info Rekening (Bank & No. Rek)</label>
                <input 
                  type="text" 
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Contoh: BCA 1234567890 a/n Toko Anda"
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid var(--color-border)', fontSize: '0.95rem' }}
                />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading || uploading} className="btn-primary" style={{ padding: '0.9rem', fontSize: '1rem', fontWeight: 700 }}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      {/* Wishlist Section */}
      <div style={{ padding: '2.5rem', background: 'var(--color-surface)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>❤️</span> Wishlist Saya
        </h2>

        {wishlistLoading ? (
          <p>Memuat wishlist...</p>
        ) : wishlist.length === 0 ? (
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
        )}
      </div>
    </div>
  );
}
