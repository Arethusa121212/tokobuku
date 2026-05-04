import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      background: '#1e293b',
      color: '#e2e8f0',
      marginTop: '4rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 1rem 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
      }}>
        {/* Brand */}
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00AA5B', marginBottom: '1rem' }}>
            Toko Buku
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.7 }}>
            Platform jual beli buku terlengkap di Indonesia. Temukan buku favoritmu dengan harga terbaik.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: '#f1f5f9' }}>Navigasi</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Beranda</Link>
            <Link href="/about" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Tentang Kami</Link>
            <Link href="/cart" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Keranjang</Link>
            <Link href="/orders" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Pesanan Saya</Link>
          </div>
        </div>

        {/* Kategori */}
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: '#f1f5f9' }}>Kategori</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <Link href="/?category=Novel" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Novel</Link>
            <Link href="/?category=Komik" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Komik</Link>
            <Link href="/?category=Akademik" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Akademik</Link>
            <Link href="/?category=Self-Help" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Self-Help</Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: '#f1f5f9' }}>Kontak</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: '#94a3b8' }}>
            <span>📧 support@tokobuku.id</span>
            <span>📞 +62 812-3456-7890</span>
            <span>📍 Jakarta, Indonesia</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid #334155',
        padding: '1.5rem 1rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#64748b',
      }}>
        © {new Date().getFullYear()} Toko Buku. All rights reserved.
      </div>
    </footer>
  );
}
