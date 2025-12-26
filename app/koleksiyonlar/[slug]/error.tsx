'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FolderTree } from 'lucide-react';
import Link from 'next/link';

export default function CollectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Collection page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
          <FolderTree className="h-8 w-8 text-orange-600 dark:text-orange-400" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Koleksiyon Yüklenemedi
        </h1>

        <p className="mb-6 text-neutral-600 dark:text-neutral-400">
          Bu koleksiyon yüklenirken bir hata oluştu.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="w-full sm:w-auto">
            Tekrar Dene
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
