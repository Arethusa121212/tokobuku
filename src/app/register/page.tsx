"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordValid = password.length >= 8 && /[A-Z]/.test(password);
  const emailValid = emailRegex.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailValid) {
      setError("Format email tidak valid. Gunakan format email resmi (contoh: nama@email.com)");
      return;
    }

    if (password.length < 8) {
      setError("Password harus minimal 8 karakter");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password harus mengandung minimal 1 huruf besar");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Terjadi kesalahan saat mendaftar");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: 'var(--color-surface)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary)', fontSize: '1.8rem' }}>Daftar Akun Baru</h1>
      
      {error && <div style={{ padding: '1rem', marginBottom: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Nama Lengkap</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="nama@email.com"
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: `1px solid ${email && !emailValid ? '#ef4444' : 'var(--color-border)'}`, fontSize: '1rem' }}
          />
          {email && !emailValid && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>Gunakan format email resmi (contoh: nama@email.com)</p>
          )}
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Minimal 8 karakter, 1 huruf besar"
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: `1px solid ${password && !passwordValid ? '#ef4444' : 'var(--color-border)'}`, fontSize: '1rem' }}
          />
          {password && (
            <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <p style={{ fontSize: '0.8rem', color: password.length >= 8 ? '#16a34a' : '#ef4444' }}>
                {password.length >= 8 ? '✓' : '✗'} Minimal 8 karakter ({password.length}/8)
              </p>
              <p style={{ fontSize: '0.8rem', color: /[A-Z]/.test(password) ? '#16a34a' : '#ef4444' }}>
                {/[A-Z]/.test(password) ? '✓' : '✗'} Minimal 1 huruf besar
              </p>
            </div>
          )}
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Daftar Sebagai</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem', background: 'white' }}
          >
            <option value="CUSTOMER">Pembeli (Customer)</option>
            <option value="SELLER">Penjual (Seller)</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem', width: '100%', opacity: loading ? 0.7 : 1 }}>
          {loading ? "Mendaftar..." : "Daftar"}
        </button>
      </form>
      
      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
        Sudah punya akun? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Masuk di sini</Link>
      </div>
    </div>
  );
}
