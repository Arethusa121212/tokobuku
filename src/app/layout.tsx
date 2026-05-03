import type { Metadata } from 'next';
import './globals.css';
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: 'Toko Buku',
  description: 'Beli buku online mudah dan cepat',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Providers>
          <Navbar />
          <main className="container" style={{ padding: '2rem 0' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
