export default function AboutPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #00AA5B 0%, #008C4A 100%)',
        color: 'white', padding: '4rem 3rem', borderRadius: '24px',
        textAlign: 'center', marginBottom: '3rem',
        boxShadow: '0 20px 60px rgba(0,170,91,0.2)'
      }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
          Tentang Toko Buku
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          Menghubungkan penulis dan pembaca di seluruh Indonesia
        </p>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Mission */}
        <div style={{
          padding: '2rem', background: 'var(--color-surface)', borderRadius: '20px',
          border: '1.5px solid var(--color-border)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎯 Misi Kami
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
            Toko Buku hadir sebagai platform marketplace yang mempertemukan penjual buku dengan pembaca. 
            Kami percaya bahwa setiap orang berhak mendapatkan akses ke buku berkualitas dengan harga yang terjangkau. 
            Melalui platform ini, kami memudahkan siapapun untuk menjual dan membeli buku dengan aman dan nyaman.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem'
        }}>
          {[
            { icon: '📚', number: '1000+', label: 'Koleksi Buku' },
            { icon: '👥', number: '500+', label: 'Pengguna Aktif' },
            { icon: '🛒', number: '2000+', label: 'Transaksi' },
          ].map((stat) => (
            <div key={stat.label} style={{
              padding: '2rem', background: 'var(--color-surface)', borderRadius: '20px',
              textAlign: 'center', border: '1.5px solid var(--color-border)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{stat.number}</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{
          padding: '2rem', background: 'var(--color-surface)', borderRadius: '20px',
          border: '1.5px solid var(--color-border)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ✨ Kenapa Toko Buku?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[
              { icon: '🔒', title: 'Transaksi Aman', desc: 'Pembayaran dijamin aman dan terpercaya' },
              { icon: '🚚', title: 'Pengiriman Cepat', desc: 'Pesanan diproses dalam 24 jam' },
              { icon: '💰', title: 'Harga Terjangkau', desc: 'Berbagai buku dengan harga bersahabat' },
              { icon: '⭐', title: 'Rating & Review', desc: 'Lihat ulasan dari pembeli lain' },
            ].map((feature) => (
              <div key={feature.title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>{feature.icon}</div>
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{feature.title}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
