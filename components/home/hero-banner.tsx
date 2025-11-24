'use client';

import Link from 'next/link';
import { Star, MapPin, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HeroBannerProps {
  collection: {
    id: string;
    slug: string;
    names: { tr: string };
    vote_score: number;
    places_count: number;
    category?: { names: { tr: string } };
    creator?: {
      email: string;
      raw_user_meta_data?: {
        name?: string;
        avatar_url?: string;
      };
    };
  };
}

export function HeroBanner({ collection }: HeroBannerProps) {
  const creatorName = collection.creator?.raw_user_meta_data?.name ||
                     collection.creator?.email?.split('@')[0] ||
                     'Anonim';
  const creatorAvatar = collection.creator?.raw_user_meta_data?.avatar_url;
  const initials = creatorName.substring(0, 2).toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-8 text-white shadow-2xl md:p-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />

      {/* Content */}
      <div className="relative z-10">
        {/* Category Badge */}
        {collection.category && (
          <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
            {collection.category.names.tr}
          </Badge>
        )}

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold md:text-5xl">
          {collection.names.tr}
        </h1>

        {/* Creator & Stats */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-white/90">
          {/* Creator */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border-2 border-white/50">
              {creatorAvatar && <AvatarImage src={creatorAvatar} alt={creatorName} />}
              <AvatarFallback className="bg-white/20 text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              Küratör: {creatorName}
            </span>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-white/30" />

          {/* Rating */}
          {collection.vote_score > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-semibold">
                {collection.vote_score.toFixed(1)} Puan
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="h-4 w-px bg-white/30" />

          {/* Places Count */}
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {collection.places_count} Mekan
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <Link href={`/collections/${collection.slug}`}>
          <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-white/90">
            Koleksiyonu İncele
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
    </div>
  );
}
