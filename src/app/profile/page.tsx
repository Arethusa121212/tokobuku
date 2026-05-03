"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session]);

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
        body: JSON.stringify({ name, image }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profil berhasil diperbarui!");
        // Update session client-side
        await update({ name, image });
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

  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2.5rem', background: 'var(--color-surface)', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Pengaturan Profil</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Avatar Upload Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <img 
              src={image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + session.user.email} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
            />
            <label style={{ 
              position: 'absolute', bottom: '0', right: '0', 
              background: 'var(--color-primary)', color: 'white', 
              width: '35px', height: '35px', borderRadius: '50%', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', 
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              fontSize: '1.2rem'
            }}>
              📷
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            {uploading ? "Sedang mengunggah..." : "Klik ikon kamera untuk ganti foto"}
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {session.user.role === "SELLER" ? "Nama Toko" : "Nama Lengkap"}
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama..."
              style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1.5px solid var(--color-border)', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Email</label>
            <input 
              type="email" 
              value={session.user.email || ""} 
              disabled 
              style={{ width: '100%', padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1.5px solid var(--color-border)', fontSize: '1rem', background: '#f8fafc', color: '#64748b' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>Email tidak dapat diubah.</p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Role</label>
            <div style={{ 
              display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '20px', 
              fontSize: '0.85rem', fontWeight: 700,
              background: session.user.role === "SELLER" ? "#fffbeb" : "#f0fdf4",
              color: session.user.role === "SELLER" ? "#b45309" : "#15803d",
              border: `1px solid ${session.user.role === "SELLER" ? "#fde68a" : "#bbf7d0"}`
            }}>
              {session.user.role === "SELLER" ? "📚 PENJUAL" : "🛒 PEMBELI"}
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || uploading}
          className="btn-primary" 
          style={{ padding: '1rem', fontSize: '1.1rem', fontWeight: 700, marginTop: '1rem', opacity: (loading || uploading) ? 0.7 : 1 }}
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
