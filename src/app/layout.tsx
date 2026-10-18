import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AppShell } from '@/components/layout/app-shell';
import { ServiceWorkerRegister } from '@/components/providers/service-worker-register';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'emasKu — Pelacak Portofolio Emas Fisik & Harga Emas Indonesia',
  description:
    'Aplikasi PWA pelacak portofolio emas batangan dan perhiasan Indonesia. Pantau harga Antam, Galeri 24, Pegadaian, hitung keuntungan, dan periksa buyback secara offline.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'emasKu',
  },
};

export const viewport: Viewport = {
  themeColor: '#cb8816',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <AppShell>{children}</AppShell>
            <ServiceWorkerRegister />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
