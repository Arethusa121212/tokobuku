"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Email atau password salah");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: 'var(--color-surface)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary)', fontSize: '1.8rem' }}>Masuk ke Toko Buku</h1>
      
      {error && <div style={{ padding: '1rem', marginBottom: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Masuk</button>
      </form>
      
      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
        Belum punya akun? <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Daftar di sini</Link>
      </div>
    </div>
  );
}
