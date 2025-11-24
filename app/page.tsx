import { getTopCollections, getFeaturedCollection } from '@/lib/api/collections';
import { getCategories } from '@/lib/api/categories';
import { getTopPlacesByCity } from '@/lib/api/places';
import { HeroBanner } from '@/components/home/hero-banner';
import { CollectionFeed } from '@/components/collections/collection-feed';
import { PlacesLeaderboard } from '@/components/leaderboard/places-leaderboard';
import { Badge } from '@/components/ui/badge';
import { Flame, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface HomePageProps {
  searchParams: Promise<{ city?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const selectedCitySlug = params.city || 'adana'; // Default to Adana

  // Fetch data in parallel
  const [featuredCollection, topCollections, categories, topPlaces] = await Promise.all([
    getFeaturedCollection(selectedCitySlug),
    getTopCollections(selectedCitySlug, 12),
    getCategories({ parent_id: null, limit: 8 }), // Get main categories
    getTopPlacesByCity(selectedCitySlug, 10),
  ]);

  return (
    <>
      {/* Hero Banner - Featured Collection */}
      {featuredCollection && (
        <section className="container mx-auto px-4 py-8">
          <HeroBanner collection={featuredCollection} />
        </section>
      )}

      {/* Top Collections Feed */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              <Flame className="h-3.5 w-3.5" />
              <span>Haftanın En Popülerleri</span>
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Öne Çıkan Koleksiyonlar
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Topluluğun en çok beğendiği mekan listeleri
            </p>
          </div>
        </div>

        <CollectionFeed collections={topCollections} />
      </section>

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="border-y border-neutral-200 bg-neutral-50 py-12 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                Kategorilere Göre Keşfet
              </h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                İlgilendiğin kategorideki mekanları bul
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group"
                >
                  <Badge
                    variant="outline"
                    className="w-full cursor-pointer justify-center border-neutral-300 bg-white px-4 py-3 text-sm transition-all hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-orange-500 dark:hover:bg-orange-950 dark:hover:text-orange-400"
                  >
                    {category.names?.tr || category.slug}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Star Places - Most Listed */}
      {topPlaces && topPlaces.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Yıldız Mekanlar</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              En Çok Listelenen Mekanlar
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Koleksiyonlarda en sık görülen popüler yerler
            </p>
          </div>

          <PlacesLeaderboard
            initialPlaces={topPlaces}
            cities={[]}
            selectedCitySlug={selectedCitySlug}
            compact={true}
          />
        </section>
      )}
    </>
  );
}
