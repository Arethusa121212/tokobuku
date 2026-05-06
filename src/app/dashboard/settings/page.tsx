"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";

export default function StoreSettings() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    storeDescription: "",
    location: "",
    whatsapp: "",
    image: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            storeDescription: data.storeDescription || "",
            location: data.location || "",
            whatsapp: data.whatsapp || "",
            image: data.image || "",
            bankName: data.bankName || "",
            accountNumber: data.accountNumber || "",
            accountHolder: data.accountHolder || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile");
      } finally {
        setFetching(false);
      }
    }
    fetchProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    setUploading(true);
    const formDataFile = new FormData();
    formDataFile.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataFile,
      });

      const data = await res.json();
      if (res.ok) {
        setFormData({ ...formData, image: data.imageUrl });
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

  if (session?.user?.role !== "SELLER") {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Akses Ditolak</h2>
        <p>Hanya penjual yang bisa mengakses halaman ini.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Profil Toko berhasil diperbarui!");
        // Update local session
        await update();
        router.refresh();
      } else {
        toast.error("Gagal memperbarui profil.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem', borderRadius: '12px',
    border: '1.5px solid var(--color-border)', fontSize: '0.95rem',
    outline: 'none', background: '#f8fafc'
  };

  const labelStyle = {
    display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: '#475569'
  };

  if (fetching) return <div style={{ textAlign: 'center', padding: '5rem' }}>Memuat...</div>;

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 700 }}>← Kembali</Link>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Pengaturan Profil Toko</h1>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Identity Section */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>🏪 Identitas Toko</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Nama Toko</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={inputStyle} 
                    required 
                  />
                </div>
                <div>
                  <label style={labelStyle}>Logo / Foto Toko</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ 
                      width: '100%', padding: '1rem', borderRadius: '12px', 
                      border: '2px dashed var(--color-border)', textAlign: 'center',
                      cursor: 'pointer', background: '#f8fafc', transition: 'all 0.2s',
                      position: 'relative', overflow: 'hidden', minHeight: '100px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {formData.image ? (
                      <img src={formData.image} alt="Store Logo" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ color: 'var(--color-text-secondary)' }}>
                        <span style={{ fontSize: '1.2rem', display: 'block' }}>📷</span>
                        <span style={{ fontSize: '0.8rem' }}>{uploading ? "Mengunggah..." : "Klik untuk ganti foto"}</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      hidden 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={uploading} 
                    />
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Deskripsi Toko</label>
                  <textarea 
                    value={formData.storeDescription}
                    onChange={(e) => setFormData({...formData, storeDescription: e.target.value})}
                    style={{ ...inputStyle, height: '100px', resize: 'none' }}
                    placeholder="Ceritakan tentang toko Anda..."
                  />
                </div>
              </div>
            </div>

            {/* Communication & Location */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>📞 Kontak & Lokasi</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Nomor WhatsApp Bisnis</label>
                  <input 
                    type="text" 
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    style={inputStyle} 
                    placeholder="Contoh: 62812345678"
                  />
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>Gunakan format angka saja (awal 62)</p>
                </div>
                <div>
                  <label style={labelStyle}>Lokasi Toko</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    style={inputStyle} 
                    placeholder="Contoh: Jakarta Pusat"
                  />
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>💳 Informasi Pembayaran</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Nama Bank</label>
                  <input 
                    type="text" 
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    style={inputStyle} 
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nomor Rekening</label>
                  <input 
                    type="text" 
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    style={inputStyle} 
                  />
                </div>
                <div>
                  <label style={labelStyle}>Atas Nama</label>
                  <input 
                    type="text" 
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                    style={inputStyle} 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ padding: '1.2rem', borderRadius: '16px', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

