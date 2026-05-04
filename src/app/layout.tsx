import type { Metadata } from 'next';
import './globals.css';
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'Toko Buku',
  description: 'Beli buku online mudah dan cepat',
};

import StatusTracker from "@/components/StatusTracker";
import ChatWidget from "@/components/ChatWidget";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Providers>
          <StatusTracker />
          <Navbar />
          <ChatWidget />
          <main className="container" style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
