'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, User, Calendar, ThumbsUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/transitions/scroll-reveal';

interface Place {
  id: string;
  slug: string;
  names: { tr: string };
  address?: string;
  vote_score: number;
  vote_count: number;
  category?: {
    id: string;
    names: { tr: string };
  };
}

interface CollectionPlace {
  id: string;
  display_order: number;
  curator_note?: string;
  recommended_items?: string[];
  place: Place;
}

interface Collection {
  id: string;
  slug: string;
  names: { tr: string };
  descriptions?: { tr: string };
  created_at: string;
  vote_count: number;
  vote_score: number;
  location?: {
    id: string;
    names: { tr: string };
    slug: string;
  };
  category?: {
    id: string;
    names: { tr: string };
    slug: string;
  };
  creator?: {
    id: string;
    username: string;
  };
  places: CollectionPlace[];
}

interface CollectionDetailViewProps {
  collection: Collection;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getRankBadgeColor = (rank: number) => {
  if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
  if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
  if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
  return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
};

export function CollectionDetailView({ collection }: CollectionDetailViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <ScrollReveal direction="down">
        <div className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfaya Dön
            </Link>

            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="mb-3">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    {collection.category?.names?.tr || 'Kategori'}
                  </Badge>
                </div>

                <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl lg:text-4xl dark:text-neutral-50">
                  {collection.names?.tr}
                </h1>

                {collection.descriptions?.tr && (
                  <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
                    {collection.descriptions.tr}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-neutral-600 sm:gap-4 sm:text-sm dark:text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{collection.location?.names?.tr || 'Tüm Şehirler'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{collection.creator?.username || 'Anonim'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{formatDate(collection.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{collection.vote_count || 0} oy</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-3 dark:bg-orange-900/20">
                <span className="text-2xl font-bold text-orange-600 sm:text-3xl dark:text-orange-400">
                  {collection.places?.length || 0}
                </span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Mekan</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Places Grid */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collection.places?.map((item: CollectionPlace, index: number) => {
              const place = item.place;
              if (!place) return null;

              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                place.address || place.names?.tr || ''
              )}`;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/mekanlar/${place.slug}?from=/koleksiyonlar/${collection.slug}`}
                    className="group block h-full"
                  >
                    <Card className="h-full overflow-hidden transition-all hover:border-orange-200 hover:shadow-md dark:hover:border-orange-900/50 dark:hover:shadow-orange-900/10">
                      <CardContent className="flex items-center gap-3 p-3">
                        {/* Rank */}
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${getRankBadgeColor(
                            index + 1
                          )}`}
                        >
                          {index + 1}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-semibold text-neutral-900 group-hover:text-orange-600 dark:text-neutral-50 dark:group-hover:text-orange-400">
                            {place.names?.tr}
                          </h3>

                          {/* Recommended Items (Minimal) */}
                          {item.recommended_items && item.recommended_items.length > 0 && (
                            <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                              {item.recommended_items.join(', ')}
                            </p>
                          )}
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-end gap-1 pl-2">
                          <div className="flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 dark:bg-orange-900/20">
                            <span className="text-sm font-bold text-orange-700 dark:text-orange-400">
                              {place.vote_score || 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
        </div>

        {/* Empty State */}
        {(!collection.places || collection.places.length === 0) && (
          <div className="py-12 text-center">
            <p className="text-neutral-500 dark:text-neutral-400">
              Bu koleksiyonda henüz mekan bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
