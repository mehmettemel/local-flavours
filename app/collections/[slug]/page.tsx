// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, User, Calendar, ThumbsUp, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

async function getCollection(slug: string) {
  const supabase = await createClient();

  const { data: collection, error } = await supabase
    .from('collections')
    .select(`
      *,
      location:locations(id, names, slug),
      category:categories!collections_category_id_fkey(id, names, slug, icon),
      creator:users!collections_creator_id_fkey(id, username)
    `)
    .eq('slug', slug)
    .single();

  if (error || !collection) return null;

  // Get places in collection
  const { data: collectionPlaces } = await supabase
    .from('collection_places')
    .select(`
      *,
      place:places(
        id,
        slug,
        names,
        descriptions,
        address,
        vote_score,
        vote_count,
        category:categories(id, names, icon)
      )
    `)
    .eq('collection_id', collection.id)
    .order('display_order', { ascending: true });

  return {
    ...collection,
    places: collectionPlaces || [],
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollection(slug);

  if (!collection) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                {collection.category?.icon && (
                  <span className="text-2xl">{collection.category.icon}</span>
                )}
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  {collection.category?.names?.tr || 'Kategori'}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                {collection.names?.tr}
              </h1>

              <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">
                {collection.descriptions?.tr}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{collection.location?.names?.tr || 'Bilinmiyor'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{collection.creator?.username || 'Anonim'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(collection.created_at)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{collection.vote_count || 0} oy</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {collection.places?.length || 0}
              </span>
              <span className="text-neutral-600 dark:text-neutral-400">Mekan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Places List */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {collection.places?.map((item: any, index: number) => {
            const place = item.place;
            if (!place) return null;

            const googleMapsUrl = place.address
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.names?.tr || '')}`;

            return (
              <div
                key={item.id}
                className="rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Rank */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/places/${place.slug}`}
                          className="text-xl font-semibold text-neutral-900 hover:text-orange-600 dark:text-neutral-50 dark:hover:text-orange-400"
                        >
                          {place.names?.tr}
                        </Link>
                        {place.category?.icon && (
                          <span className="text-lg">{place.category.icon}</span>
                        )}
                      </div>

                      {place.address && (
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                          {place.address}
                        </p>
                      )}

                      {item.curator_note && (
                        <p className="mt-2 text-sm italic text-neutral-700 dark:text-neutral-300">
                          "{item.curator_note}"
                        </p>
                      )}

                      {item.recommended_items && item.recommended_items.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.recommended_items.map((rec: string, i: number) => (
                            <span
                              key={i}
                              className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            >
                              {rec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-3">
                    {/* Score */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                        {place.vote_score || 0}
                      </div>
                      <div className="text-xs text-neutral-500">puan</div>
                    </div>

                    {/* Google Maps */}
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          {(!collection.places || collection.places.length === 0) && (
            <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-neutral-500">Bu koleksiyonda henüz mekan yok.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
