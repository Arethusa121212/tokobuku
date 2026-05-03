"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewBookPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "1",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";

      // Upload image first if selected
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          alert(uploadErr.message || "Gagal mengupload gambar");
          setLoading(false);
          return;
        }

        const uploadResult = await uploadRes.json();
        imageUrl = uploadResult.imageUrl;
      }

      // Create book
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          stock: parseInt(formData.stock),
          imageUrl,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal menambahkan buku");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Tambah Buku Baru</h1>
        <Link href="/dashboard" style={{ color: 'var(--color-text-secondary)' }}>Batal</Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Judul Buku</label>
          <input 
            type="text" name="title" required value={formData.title} onChange={handleChange}
            style={inputStyle}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Deskripsi</label>
          <textarea 
            name="description" required rows={4} value={formData.description} onChange={handleChange}
            style={{ ...inputStyle, resize: 'vertical' as const }}
          ></textarea>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Harga (Rp)</label>
            <input 
              type="number" name="price" required min="0" value={formData.price} onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Stok</label>
            <input 
              type="number" name="stock" required min="1" value={formData.stock} onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Gambar Cover (Opsional)</label>
          
          {imagePreview ? (
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--color-border)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }} 
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                style={{
                  position: 'absolute', top: '8px', right: '8px',
                  background: 'rgba(0,0,0,0.6)', color: 'white',
                  border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                  cursor: 'pointer', fontSize: '1rem', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--color-border)',
                borderRadius: '12px', padding: '2.5rem 1rem',
                textAlign: 'center', cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
                background: 'var(--color-bg)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.background = '#f0fdf4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.background = 'var(--color-bg)';
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</div>
              <p style={{ fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.3rem' }}>Klik untuk pilih gambar</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>JPG, PNG, WEBP, atau GIF (maks. 5MB)</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
          {loading ? "Menyimpan..." : "Simpan Buku"}
        </button>
      </form>
    </div>
  );
}
