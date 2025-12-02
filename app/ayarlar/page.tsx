'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { EditUsernameForm } from '@/components/profile/edit-username-form';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/?auth=login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-8 py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Ayarlar
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Profil ayarlarınızı yönetin
        </p>
      </div>

      <EditUsernameForm />
    </div>
  );
}
