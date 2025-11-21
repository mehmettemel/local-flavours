// @ts-nocheck
'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { MapPin, TrendingUp, ThumbsUp, ThumbsDown, Loader2, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from 'sonner';

interface Place {
  id: string;
  slug: string;
  names: { en: string; tr: string };
  descriptions: { en: string; tr: string };
  address?: string;
  vote_score: number;
  vote_count: number;
  upvote_count: number;
  downvote_count: number;
  category?: {
    slug: string;
    names: { en: string; tr: string };
    icon: string;
  };
  location?: {
    slug: string;
    names: { en: string; tr: string };
  };
}

interface City {
  id: string;
  slug: string;
  names: { en: string; tr: string };
}

interface PlacesLeaderboardProps {
  initialPlaces: Place[];
  cities: City[];
  selectedCitySlug: string;
}

export function PlacesLeaderboard({
  initialPlaces,
  cities,
  selectedCitySlug,
}: PlacesLeaderboardProps) {
  const [selectedCity, setSelectedCity] = useState(selectedCitySlug);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filteredPlaces, setFilteredPlaces] = useState(initialPlaces);
  const [categories, setCategories] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();
  const { user, session } = useAuth();

  // Featured cities for quick access buttons
  const featuredCities = ['istanbul', 'ankara', 'izmir', 'antalya', 'bursa'];
  const featuredCityButtons = cities.filter((city) =>
    featuredCities.includes(city.slug)
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, slug, names, icon')
        .order('display_order');

      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  // Top 6 categories to show as buttons
  const topCategories = categories.slice(0, 6);
  // Rest of categories for combobox
  const restCategories = categories.slice(6);

  // Filter places when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setFilteredPlaces(initialPlaces);
    } else {
      const filtered = initialPlaces.filter(
        (place) => place.category?.slug === selectedCategory
      );
      setFilteredPlaces(filtered);
    }
  }, [selectedCategory, initialPlaces]);

  const handleCityChange = (citySlug: string) => {
    setSelectedCity(citySlug);
    startTransition(() => {
      router.push(`/?city=${citySlug}`);
    });
  };

  const handleVote = async (placeId: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('Oy vermek için giriş yapmalısınız', {
        action: {
          label: 'Giriş Yap',
          onClick: () => window.dispatchEvent(new CustomEvent('open-login-dialog')),
        },
      });
      return;
    }

    console.log('Voting with user:', user.id, 'for place:', placeId);
    console.log('Session from context:', session?.user?.id);

    if (!session) {
      toast.error('Oturum bulunamadı, lütfen tekrar giriş yapın');
      return;
    }

    try {
      const voteValue = voteType === 'up' ? 1 : -1;

      // Check if user already voted
      const { data: existingVote, error: selectError } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('place_id', placeId)
        .maybeSingle();

      if (selectError) {
        console.error('Select error:', selectError);
        throw selectError;
      }

      if (existingVote) {
        // If same vote, remove it (toggle off)
        if (existingVote.value === voteValue) {
          const { error } = await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);

          if (error) {
            console.error('Delete error:', error);
            throw error;
          }
          toast.success('Oyunuz kaldırıldı');
        } else {
          // Update existing vote
          const { error } = await supabase
            .from('votes')
            .update({ value: voteValue })
            .eq('id', existingVote.id);

          if (error) {
            console.error('Update error:', error);
            throw error;
          }
          toast.success(voteType === 'up' ? 'Beğendiniz!' : 'Beğenmediniz');
        }
      } else {
        // Insert new vote
        const { error } = await supabase
          .from('votes')
          .insert([{ user_id: user.id, place_id: placeId, value: voteValue }]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast.success(voteType === 'up' ? 'Beğendiniz!' : 'Beğenmediniz');
      }

      // Refresh the page to show updated votes
      router.refresh();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(`Oy kullanılırken bir hata oluştu: ${error.message || error}`);
    }
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  // Manual emoji mapping for categories
  const getCategoryEmoji = (categorySlug?: string) => {
    const emojiMap: { [key: string]: string } = {
      yemek: '🍽️',
      kafe: '☕',
      bar: '🍺',
      genel: '📍',
      doner: '🥙',
      hamburger: '🍔',
      tatli: '🍰',
      kebap: '🍖',
      pizza: '🍕',
      durum: '🌯',
      balik: '🐟',
      pide: '🥖',
      corba: '🍜',
      'ev-yemekleri': '🥘',
      makarna: '🍝',
      kahvalti: '🍳',
    };
    return emojiMap[categorySlug || ''] || '🍽️';
  };

  return (
    <div className="space-y-6">
      {/* City Selector Section */}
      <div className="space-y-4">
        {/* Category Filter Badges */}
        <div className="space-y-3">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Kategori:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {/* Tümü button */}
            <Button
              variant={!selectedCategory ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
              className="h-9"
            >
              Tümü
            </Button>

            {/* Top 6 categories as buttons */}
            {topCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.slug)}
                className="h-9 gap-1.5"
              >
                <span>{getCategoryEmoji(category.slug)}</span>
                <span>{category.names.tr}</span>
                {selectedCategory === category.slug && (
                  <X className="ml-1 h-3 w-3" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory('');
                  }} />
                )}
              </Button>
            ))}

            {/* Rest of categories in combobox */}
            {restCategories.length > 0 && (
              <Combobox
                options={restCategories.map((cat) => ({
                  value: cat.slug,
                  label: `${getCategoryEmoji(cat.slug)} ${cat.names.tr}`,
                }))}
                value={selectedCategory && restCategories.find(c => c.slug === selectedCategory) ? selectedCategory : ''}
                onValueChange={(value) => setSelectedCategory(value)}
                placeholder="Diğer kategoriler..."
                searchPlaceholder="Kategori ara..."
                emptyText="Kategori bulunamadı."
                className="w-[200px]"
              />
            )}
          </div>
        </div>
        {/* Quick Access Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Hızlı Erişim:
          </span>
          {/* Tüm Şehirler button */}
          <Button
            variant={selectedCity === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCityChange('all')}
            className="gap-2"
          >
            <MapPin className="h-3.5 w-3.5" />
            Tüm Şehirler
          </Button>
          {featuredCityButtons.map((city) => (
            <Button
              key={city.id}
              variant={selectedCity === city.slug ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCityChange(city.slug)}
              className="gap-2"
            >
              <MapPin className="h-3.5 w-3.5" />
              {city.names.tr}
            </Button>
          ))}
        </div>

        {/* Dropdown for All Cities */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Tüm Şehirler:
          </span>
          <Combobox
            options={cities.map((city) => ({
              value: city.slug,
              label: city.names.tr,
            }))}
            value={selectedCity}
            onValueChange={handleCityChange}
            placeholder="Şehir seçin..."
            searchPlaceholder="Şehir ara..."
            emptyText="Şehir bulunamadı."
            className="w-[250px]"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-lg border border-neutral-200 bg-white transition-opacity duration-300 dark:border-neutral-800 dark:bg-neutral-900" style={{ opacity: isPending ? 0.6 : 1 }}>
        <div className="border-b border-neutral-200 p-6 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            {isPending ? (
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            ) : (
              <TrendingUp className="h-6 w-6 text-orange-500" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {selectedCity === 'all'
                  ? 'Tüm Şehirler - Top 20 Mekanlar'
                  : `${cities.find((c) => c.slug === selectedCity)?.names.tr} - Top 20 Mekanlar`
                }
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Topluluk oylarına göre sıralanan en iyi mekanlar
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center">Sıra</TableHead>
                <TableHead>Mekan</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-center">Harita</TableHead>
                <TableHead className="text-center">Puan</TableHead>
                <TableHead className="text-right">Oy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <MapPin className="h-8 w-8 text-neutral-400" />
                      <p className="text-sm text-neutral-500">
                        {selectedCategory
                          ? 'Bu kategoride mekan bulunamadı'
                          : 'Bu şehir için henüz mekan eklenmemiş'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlaces.map((place, index) => {
                  const rank = index + 1;
                  const names = place.names as { en: string; tr: string };
                  const categoryNames = place.category?.names as
                    | { en: string; tr: string }
                    | undefined;

                  const googleMapsUrl = place.address
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(names.tr)}`;

                  return (
                    <TableRow
                      key={place.id}
                      className="group cursor-pointer hover:bg-orange-50/50 dark:hover:bg-orange-950/20"
                      onClick={() => router.push(`/places/${place.slug}`)}
                    >
                      <TableCell className="text-center font-semibold">
                        <span className="text-lg">{getRankEmoji(rank)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="block font-medium group-hover:text-orange-600 dark:group-hover:text-orange-400">
                          {names.tr}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getCategoryEmoji(place.category?.slug)}
                          </span>
                          <span className="text-sm">
                            {categoryNames?.tr || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                          <TrendingUp className="h-3 w-3" />
                          {place.vote_score || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                            onClick={() => handleVote(place.id, 'up')}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <span className="min-w-[2ch] text-center text-sm font-medium text-green-600 dark:text-green-400">
                            {place.upvote_count || 0}
                          </span>
                          <span className="text-neutral-300 dark:text-neutral-600">/</span>
                          <span className="min-w-[2ch] text-center text-sm font-medium text-red-600 dark:text-red-400">
                            {place.downvote_count || 0}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            onClick={() => handleVote(place.id, 'down')}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer with additional info */}
        <div className="border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Sıralama, kullanıcı oylarına ve hesap yaşına göre ağırlıklandırılmış puanlara dayanır.
            Veriler gerçek zamanlı olarak güncellenir.
          </p>
        </div>
      </div>
    </div>
  );
}
