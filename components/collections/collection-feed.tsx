'use client';

import Link from 'next/link';
import { Star, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CollectionFeedItem {
  id: string;
  slug: string;
  names: { tr: string; en: string };
  vote_score: number;
  places_count: number;
  category?: { names: { tr: string } };
  creator?: {
    id: string;
    username: string;
    raw_user_meta_data?: {
      avatar_url?: string;
    };
  };
  preview_places?: Array<{
    id: string;
    names: { tr: string };
  }>;
}

interface CollectionFeedProps {
  collections: CollectionFeedItem[];
}

function CollectionCard({ collection }: { collection: CollectionFeedItem }) {
  const creatorName = collection.creator?.username || 'Anonim';
  const creatorAvatar = collection.creator?.raw_user_meta_data?.avatar_url;
  const initials = creatorName.substring(0, 2).toUpperCase();

  return (
    <Link href={`/koleksiyonlar/${collection.slug}`}>
      <Card className="group h-full transition-all hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-4">
          {/* Category Badge */}
          {collection.category && (
            <Badge variant="secondary" className="mb-3">
              {collection.category.names.tr}
            </Badge>
          )}

          {/* Collection Title */}
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-3 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {collection.names.tr}
          </h3>

          {/* Preview Places */}
          {collection.preview_places && collection.preview_places.length > 0 && (
            <div className="mb-3 space-y-1">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
                Öne Çıkan Mekanlar:
              </p>
              {collection.preview_places.slice(0, 3).map((place, idx) => (
                <div key={place.id} className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                  <MapPin className="h-3 w-3 flex-shrink-0 text-orange-500" />
                  <span className="truncate">{place.names.tr}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{collection.places_count} mekan</span>
            </div>
            {collection.vote_score > 0 && (
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-medium">{collection.vote_score.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t border-neutral-100 dark:border-neutral-800 p-4">
          {/* Creator */}
          <div className="flex items-center gap-2 w-full">
            <Avatar className="h-7 w-7">
              {creatorAvatar && <AvatarImage src={creatorAvatar} alt={creatorName} />}
              <AvatarFallback className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                {creatorName}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function CollectionFeed({ collections }: CollectionFeedProps) {
  if (!collections || collections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 dark:text-neutral-400">
          Henüz koleksiyon bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
