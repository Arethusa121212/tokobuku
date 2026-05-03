"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<"choose" | "form">("choose");
  const [role, setRole] = useState<"CUSTOMER" | "SELLER" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordValid = password.length >= 8 && /[A-Z]/.test(password);
  const emailValid = emailRegex.test(email);

  const handleRoleSelect = (selectedRole: "CUSTOMER" | "SELLER") => {
    setRole(selectedRole);
    setStep("form");
  };

  const handleBack = () => {
    setStep("choose");
    setRole(null);
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.85rem 1rem', borderRadius: '10px',
    border: '1.5px solid var(--color-border)', fontSize: '1rem',
    outline: 'none', transition: 'border-color 0.2s',
  };

  // Step 1: Choose Role
  if (step === "choose") {
    return (
      <div style={{ maxWidth: '520px', margin: '4rem auto', padding: '2.5rem', background: 'var(--color-surface)', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-text-primary)', fontSize: '1.8rem', fontWeight: 800 }}>
          Buat Akun Baru
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '2.5rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Pilih jenis akun yang ingin Anda daftarkan
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Customer Card */}
          <button
            onClick={() => handleRoleSelect("CUSTOMER")}
            style={{
              display: 'flex', alignItems: 'center', gap: '1.2rem',
              padding: '1.5rem', borderRadius: '12px',
              border: '2px solid var(--color-border)', background: 'var(--color-bg)',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.background = '#f0fdf4';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,170,91,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.background = 'var(--color-bg)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🛒</div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.3rem' }}>
                Daftar sebagai Pembeli
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                Jelajahi dan beli buku dari berbagai penjual
              </div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>→</div>
          </button>

          {/* Seller Card */}
          <button
            onClick={() => handleRoleSelect("SELLER")}
            style={{
              display: 'flex', alignItems: 'center', gap: '1.2rem',
              padding: '1.5rem', borderRadius: '12px',
              border: '2px solid var(--color-border)', background: 'var(--color-bg)',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f59e0b';
              e.currentTarget.style.background = '#fffbeb';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(245,158,11,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.background = 'var(--color-bg)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>📚</div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.3rem' }}>
                Daftar sebagai Penjual
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                Buka toko online dan jual buku Anda
              </div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>→</div>
          </button>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Sudah punya akun? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Masuk di sini</Link>
        </div>
      </div>
    );
  }

  // Step 2: Registration Form
  const isSeller = role === "SELLER";

  return (
    <div style={{ maxWidth: '420px', margin: '4rem auto', padding: '2.5rem', background: 'var(--color-surface)', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
      {/* Header with back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
        <button
          onClick={handleBack}
          style={{
            background: 'var(--color-bg)', border: '1.5px solid var(--color-border)',
            borderRadius: '10px', padding: '0.5rem 0.8rem', cursor: 'pointer',
            fontSize: '1rem', color: 'var(--color-text-secondary)', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
        >
          ← Kembali
        </button>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            {isSeller ? "Daftar Penjual" : "Daftar Pembeli"}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            {isSeller ? "📚 Buat akun toko buku Anda" : "🛒 Buat akun pembeli Anda"}
          </p>
        </div>
      </div>

      {/* Role Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.4rem 0.8rem', borderRadius: '20px', marginBottom: '1.5rem',
        fontSize: '0.8rem', fontWeight: 600,
        background: isSeller ? '#fffbeb' : '#f0fdf4',
        color: isSeller ? '#b45309' : '#15803d',
        border: `1px solid ${isSeller ? '#fde68a' : '#bbf7d0'}`,
      }}>
        {isSeller ? "📚 Penjual" : "🛒 Pembeli"}
      </div>

      {error && (
        <div style={{ padding: '0.8rem 1rem', marginBottom: '1.2rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            {isSeller ? "Nama Toko" : "Nama Lengkap"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={isSeller ? "Contoh: Toko Buku Sejahtera" : "Contoh: Budi Santoso"}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="nama@email.com"
            style={{ ...inputStyle, borderColor: email && !emailValid ? '#ef4444' : 'var(--color-border)' }}
          />
          {email && !emailValid && (
            <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem' }}>Gunakan format email resmi (contoh: nama@email.com)</p>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Minimal 8 karakter, 1 huruf besar"
            style={{ ...inputStyle, paddingRight: '3rem', borderColor: password && !passwordValid ? '#ef4444' : 'var(--color-border)' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute', right: '0.8rem', top: '2.1rem',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.2rem', color: 'var(--color-text-secondary)',
            }}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
          {password && (
            <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <p style={{ fontSize: '0.78rem', color: password.length >= 8 ? '#16a34a' : '#ef4444', margin: 0 }}>
                {password.length >= 8 ? '✓' : '✗'} Minimal 8 karakter ({password.length}/8)
              </p>
              <p style={{ fontSize: '0.78rem', color: /[A-Z]/.test(password) ? '#16a34a' : '#ef4444', margin: 0 }}>
                {/[A-Z]/.test(password) ? '✓' : '✗'} Minimal 1 huruf besar
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ marginTop: '0.5rem', width: '100%', padding: '0.9rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Mendaftar..." : isSeller ? "Buat Akun Penjual" : "Buat Akun Pembeli"}
        </button>
      </form>

      <div style={{ marginTop: '1.8rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
        Sudah punya akun? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Masuk di sini</Link>
      </div>
    </div>
  );
}
