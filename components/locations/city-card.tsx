'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { MapPin, Store } from 'lucide-react';
import { Location } from '@/lib/api/locations';
import { Locale } from '@/i18n/config';

interface CityCardProps {
  city: Location & { placeCount?: number };
}

export function CityCard({ city }: CityCardProps) {
  const locale = useLocale() as Locale;
  const cityNames = city.names as any;
  const cityName = cityNames?.[locale] || cityNames?.en || city.slug;

  return (
    <Link
      href={`/${locale}/turkey/${city.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* Icon Header */}
      <div className="relative flex h-32 w-full items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
        <MapPin className="h-16 w-16 text-orange-500 dark:text-orange-400" />

        {/* Place count badge */}
        {city.placeCount !== undefined && city.placeCount > 0 && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-sm dark:bg-neutral-900/90">
            <Store className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
              {city.placeCount}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="mb-2 text-xl font-bold text-neutral-900 transition-colors group-hover:text-neutral-700 dark:text-neutral-50 dark:group-hover:text-neutral-300">
          {cityName}
        </h3>

        {city.has_districts && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            View districts →
          </p>
        )}
      </div>
    </Link>
  );
}
