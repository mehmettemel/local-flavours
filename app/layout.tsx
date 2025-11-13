import type { Metadata } from 'next';
import { locales } from '@/i18n/config';

export const metadata: Metadata = {
  title: 'LocalFlavors - Discover Authentic Local Places',
  description:
    'Find the best local restaurants, cafes, and authentic places recommended by the community.',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
