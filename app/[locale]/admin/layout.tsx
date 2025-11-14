import Link from 'next/link';
import { MapPin, Store, LayoutDashboard, FolderTree, BookMarked } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex h-16 items-center border-b border-neutral-200 px-6 dark:border-neutral-800">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            Admin Dashboard
          </h1>
        </div>

        <nav className="space-y-1 p-4">
          <Link
            href={`/${locale}/admin`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            href={`/${locale}/admin/places`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
          >
            <Store className="h-5 w-5" />
            <span className="font-medium">Places</span>
          </Link>

          <Link
            href={`/${locale}/admin/locations`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
          >
            <MapPin className="h-5 w-5" />
            <span className="font-medium">Locations</span>
          </Link>

          <Link
            href={`/${locale}/admin/categories`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
          >
            <FolderTree className="h-5 w-5" />
            <span className="font-medium">Categories</span>
          </Link>

          <Link
            href={`/${locale}/admin/collections`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
          >
            <BookMarked className="h-5 w-5" />
            <span className="font-medium">Collections</span>
          </Link>
        </nav>

        <Separator className="my-4" />

        <div className="px-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
