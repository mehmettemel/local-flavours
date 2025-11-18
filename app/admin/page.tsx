import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, MapPin, FolderTree, Users, BookMarked, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch counts
  const [
    { count: placesCount },
    { count: locationsCount },
    { count: categoriesCount },
    { count: usersCount },
    { count: collectionsCount },
    { count: pendingPlaces },
  ] = await Promise.all([
    supabase.from('places').select('*', { count: 'exact', head: true }),
    supabase.from('locations').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('collections').select('*', { count: 'exact', head: true }),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Kontrol Paneli
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          LocalFlavors platformunuza genel bakış
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Mekan</CardTitle>
            <Store className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placesCount || 0}</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {pendingPlaces || 0} onay bekliyor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Koleksiyonlar</CardTitle>
            <BookMarked className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionsCount || 0}</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Kullanıcı koleksiyonları
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kullanıcılar</CardTitle>
            <Users className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount || 0}</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Kayıtlı kullanıcılar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lokasyonlar</CardTitle>
            <MapPin className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationsCount || 0}</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Şehirler ve ilçeler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategoriler</CardTitle>
            <FolderTree className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoriesCount || 0}</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Mekan kategorileri
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktivite</CardTitle>
            <TrendingUp className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Canlı</div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Platform aktif
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/places">
              <Button variant="outline" className="w-full justify-start">
                <Store className="mr-2 h-4 w-4" />
                Mekanları Yönet
              </Button>
            </Link>
            <Link href="/admin/collections">
              <Button variant="outline" className="w-full justify-start">
                <BookMarked className="mr-2 h-4 w-4" />
                Koleksiyonları Yönet
              </Button>
            </Link>
            <Link href="/admin/locations">
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                Lokasyonları Yönet
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistem Durumu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Veritabanı
              </span>
              <span className="text-sm font-medium text-green-600">Bağlı</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Kimlik Doğrulama
              </span>
              <span className="text-sm font-medium text-green-600">Aktif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Koleksiyon Sistemi
              </span>
              <span className="text-sm font-medium text-green-600">Etkin</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
