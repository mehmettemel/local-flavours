import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { AlertDialogProvider } from '@/components/providers/alert-dialog-provider';
import { SiteHeader } from '@/components/layout/site-header';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://localflavours.com'),
  title: {
    default: 'Local Flavours - Şehrin En İyi Lezzetlerini Keşfet',
    template: '%s | Local Flavours',
  },
  description:
    'Yerel lezzetleri keşfedin, kendi koleksiyonlarınızı oluşturun ve şehrin en iyi mekanlarını paylaşın.',
  keywords: ['mekan keşfi', 'restoranlar', 'yemek koleksiyonları', 'yerel lezzetler', 'istanbul mekanları'],
  authors: [{ name: 'Local Flavours Team' }],
  creator: 'Local Flavours',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    title: 'Local Flavours - Şehrin En İyi Lezzetlerini Keşfet',
    description:
      'Yerel lezzetleri keşfedin, kendi koleksiyonlarınızı oluşturun ve şehrin en iyi mekanlarını paylaşın.',
    siteName: 'Local Flavours',
    images: [
      {
        url: '/og-image.jpg', // Make sure to add a default OG image later if needed
        width: 1200,
        height: 630,
        alt: 'Local Flavours',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Local Flavours - Şehrin En İyi Lezzetlerini Keşfet',
    description:
      'Yerel lezzetleri keşfedin, kendi koleksiyonlarınızı oluşturun ve şehrin en iyi mekanlarını paylaşın.',
    creator: '@localflavours',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <SiteHeader />
              {children}
              <Toaster richColors position="top-center" />
              <AlertDialogProvider />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
