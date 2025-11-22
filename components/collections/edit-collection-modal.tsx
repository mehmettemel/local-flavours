// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Loader2, X, GripVertical, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { GooglePlacesAutocomplete } from '@/components/ui/google-places-autocomplete';
import { matchLocationFromGoogle } from '@/lib/utils/match-location';
import { useAlertDialog } from '@/hooks/use-alert-dialog';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PlaceInArray {
  id: string; // temp ID for local state
  type: 'google' | 'text';
  name: string;
  google_place_id?: string;
  address?: string;
  rating?: number;
  user_ratings_total?: number;
  photo_url?: string;
  details?: any; // Full Google place details
}

interface EditCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
  collection?: any;
}

function SortablePlaceItem({
  place,
  index,
  onRemove,
}: {
  place: PlaceInArray;
  index: number;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      {/* Number & Drag Handle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {index + 1}.
        </span>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-neutral-400 hover:text-neutral-600 active:cursor-grabbing dark:hover:text-neutral-300"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Photo (if Google) */}
      {place.photo_url && (
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded">
          <img
            src={place.photo_url}
            alt={place.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-neutral-900 dark:text-neutral-50">
          {place.name}
        </div>
        {place.type === 'google' && place.address && (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="mt-0.5 flex max-w-[300px] min-w-0 items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{place.address}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{place.address}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {place.type === 'google' && place.rating && (
          <div className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
            ⭐ {place.rating} ({place.user_ratings_total || 0})
          </div>
        )}
        {place.type === 'text' && (
          <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            📝 Kullanıcı ekledi
          </div>
        )}
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-7 w-7 p-0 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function EditCollectionModal({
  open,
  onOpenChange,
  onSuccess,
  userId,
  collection,
}: EditCollectionModalProps) {
  const supabase = createClient();
  const isEdit = !!collection;
  const { alert, confirm } = useAlertDialog();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Places array (local state)
  const [places, setPlaces] = useState<PlaceInArray[]>([]);

  // Google autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Track if form has been modified
  const [isModified, setIsModified] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (open) {
      fetchCategories();
      if (isEdit) {
        loadCollectionData();
      }
    } else {
      resetForm();
    }
  }, [open, collection]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, slug, names')
      .order('display_order');

    setCategories(data || []);
  };

  const loadCollectionData = async () => {
    setName(collection.names?.tr || '');
    setCategoryId(collection.category_id || '');

    // Fetch places
    const { data: placesData } = await supabase
      .from('collection_places')
      .select(
        `
        *,
        place:places(*)
      `
      )
      .eq('collection_id', collection.id)
      .order('display_order', { ascending: true });

    if (placesData) {
      const mappedPlaces = placesData.map((cp) => ({
        id: cp.id,
        type: cp.place.google_place_id ? 'google' : 'text',
        name: cp.place.names?.tr,
        google_place_id: cp.place.google_place_id,
        address: cp.place.address,
        rating: cp.place.rating,
        user_ratings_total: cp.place.user_ratings_total,
        photo_url: cp.place.images?.[0],
        details: cp.place,
      }));
      setPlaces(mappedPlaces);
    }
  };

  const handleGooglePlaceSelect = async (
    placeId: string,
    description: string
  ) => {
    setLoadingDetails(true);
    try {
      // Check if already in array
      if (places.some((p) => p.google_place_id === placeId)) {
        alert('Bu mekan zaten listede!');
        setSearchQuery('');
        setLoadingDetails(false);
        return;
      }

      // Fetch place details
      const response = await fetch(`/api/places/details?place_id=${placeId}`);
      if (!response.ok) throw new Error('Mekan bilgileri alınamadı');

      const details = await response.json();

      // Add to array
      const newPlace: PlaceInArray = {
        id: `temp-${Date.now()}`,
        type: 'google',
        name: details.name,
        google_place_id: placeId,
        address: details.address,
        rating: details.rating,
        user_ratings_total: details.user_ratings_total,
        photo_url: details.photos?.[0]?.url,
        details,
      };

      setPlaces([...places, newPlace]);
      setSearchQuery('');
    } catch (error: any) {
      console.error('Error fetching place details:', error);
      alert('Mekan bilgileri alınamadı: ' + error.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();

      // Check duplicate name
      if (
        places.some(
          (p) => p.name.toLowerCase() === searchQuery.trim().toLowerCase()
        )
      ) {
        alert('Bu isimde bir mekan zaten listede!');
        setSearchQuery('');
        return;
      }

      // Add as text
      const newPlace: PlaceInArray = {
        id: `temp-${Date.now()}`,
        type: 'text',
        name: searchQuery.trim(),
      };

      setPlaces([...places, newPlace]);
      setSearchQuery('');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = places.findIndex((p) => p.id === active.id);
    const newIndex = places.findIndex((p) => p.id === over.id);

    setPlaces(arrayMove(places, oldIndex, newIndex));
  };

  const handleRemovePlace = (id: string) => {
    setPlaces(places.filter((p) => p.id !== id));
  };

  const generateSlug = (text: string) => {
    const turkishMap: { [key: string]: string } = {
      ç: 'c',
      ğ: 'g',
      ı: 'i',
      İ: 'i',
      ö: 'o',
      ş: 's',
      ü: 'u',
      Ç: 'c',
      Ğ: 'g',
      Ö: 'o',
      Ş: 's',
      Ü: 'u',
    };

    return text
      .split('')
      .map((char) => turkishMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !categoryId) {
      alert('Lütfen koleksiyon adı ve kategori seçin');
      return;
    }

    if (places.length < 2) {
      alert('En az 2 mekan eklemelisiniz');
      return;
    }

    if (places.length > 20) {
      alert('En fazla 20 mekan ekleyebilirsiniz');
      return;
    }

    setLoading(true);

    try {
      const slug = isEdit
        ? collection.slug
        : generateSlug(name) + '-' + Math.random().toString(36).substring(2, 6);

      const collectionData = {
        slug,
        names: { tr: name, en: name },
        creator_id: userId,
        category_id: categoryId,
        status: 'active',
      };

      let collectionId = collection?.id;

      if (isEdit) {
        // Update collection
        const { error } = await supabase
          .from('collections')
          .update(collectionData)
          .eq('id', collection.id);

        if (error) throw error;

        // Delete existing collection_places
        await supabase
          .from('collection_places')
          .delete()
          .eq('collection_id', collection.id);
      } else {
        // Create collection
        const { data, error } = await supabase
          .from('collections')
          .insert([collectionData])
          .select()
          .single();

        if (error) throw error;
        collectionId = data.id;
      }

      // Process places
      for (let index = 0; index < places.length; index++) {
        const place = places[index];
        let placeId;

        if (place.type === 'google' && place.google_place_id) {
          // Check if place exists in database
          const { data: existingPlace } = await supabase
            .from('places')
            .select('id')
            .eq('google_place_id', place.google_place_id)
            .single();

          if (existingPlace) {
            placeId = existingPlace.id;
          } else {
            // Create new place from Google data
            const locationId = place.details?.extracted_location
              ? (
                  await matchLocationFromGoogle(
                    place.details.extracted_location
                  )
                )?.id
              : null;

            const { data: newPlace, error: placeError } = await supabase
              .from('places')
              .insert({
                slug:
                  generateSlug(place.name) +
                  '-' +
                  Math.random().toString(36).substring(2, 6),
                names: { tr: place.name, en: place.name },
                google_place_id: place.google_place_id,
                address: place.address || null,
                location_id: locationId,
                category_id: categoryId,
                phone_number: place.details?.phone_number || null,
                website: place.details?.website || null,
                latitude: place.details?.location?.lat || null,
                longitude: place.details?.location?.lng || null,
                rating: place.rating || null,
                user_ratings_total: place.user_ratings_total || null,
                price_level: place.details?.price_level || null,
                opening_hours: place.details?.opening_hours || null,
                images:
                  place.details?.photos?.slice(0, 5).map((p: any) => p.url) ||
                  [],
                status: 'approved',
                vote_count: 0,
                vote_score: 0,
              })
              .select('id')
              .single();

            if (placeError) throw placeError;
            placeId = newPlace.id;
          }
        } else {
          // Text place - create minimal place
          const { data: newPlace, error: placeError } = await supabase
            .from('places')
            .insert({
              slug:
                generateSlug(place.name) +
                '-' +
                Math.random().toString(36).substring(2, 6),
              names: { tr: place.name, en: place.name },
              google_place_id: null,
              category_id: categoryId,
              status: 'approved',
              vote_count: 0,
              vote_score: 0,
            })
            .select('id')
            .single();

          if (placeError) throw placeError;
          placeId = newPlace.id;
        }

        // Add to collection_places
        const { error: cpError } = await supabase
          .from('collection_places')
          .insert({
            collection_id: collectionId,
            place_id: placeId,
            display_order: index,
          });

        if (cpError) throw cpError;
      }

      onSuccess();
      setIsModified(false);
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving collection:', error);
      alert(error.message || 'Koleksiyon kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCategoryId('');
    setPlaces([]);
    setSearchQuery('');
  };

  const canSubmit =
    name.trim() &&
    categoryId &&
    places.length >= 2 &&
    places.length <= 20 &&
    !loading;

  // Mark form as modified when any field changes
  useEffect(() => {
    if (name || categoryId || places.length > 0 || searchQuery) {
      setIsModified(true);
    }
  }, [name, categoryId, places, searchQuery]);

  // Handle dialog close with confirmation
  const handleOpenChange = async (newOpen: boolean) => {
    if (!newOpen && isModified && !loading) {
      const confirmed = await confirm('Değişiklikler kaydedilmedi. Çıkmak istediğinize emin misiniz?');
      if (confirmed) {
        onOpenChange(false);
        setIsModified(false);
      }
    } else {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="h-[95vh] w-[95vw] max-w-5xl overflow-hidden p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 border-b border-neutral-200 p-4 sm:p-6 dark:border-neutral-800">
            <DialogTitle className="text-xl sm:text-2xl">
              {isEdit ? 'Koleksiyonu Düzenle' : 'Yeni Koleksiyon Oluştur'}
            </DialogTitle>
          </DialogHeader>

          {/* Content - Scrollable */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-6 sm:p-6">
              {/* Collection Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">
                    Koleksiyon Adı <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adana'nın En İyi Kebapçıları"
                    required
                    maxLength={100}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="category">
                    Kategori <span className="text-red-500">*</span>
                  </Label>
                  <Combobox
                    options={categories.map((category) => ({
                      value: category.id,
                      label: category.names.tr,
                    }))}
                    value={categoryId}
                    onValueChange={setCategoryId}
                    placeholder="Kategori seçin..."
                    searchPlaceholder="Kategori ara..."
                    emptyText="Kategori bulunamadı."
                    className="h-11"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-200 dark:border-neutral-800" />

              {/* Places Section */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base">
                    Mekanlar ({places.length}/20)
                  </Label>
                  {places.length < 2 && (
                    <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                      En az 2 mekan eklemelisiniz
                    </p>
                  )}
                </div>

                {/* Google Autocomplete Input */}
                <div className="space-y-2">
                  <div className="relative">
                    <GooglePlacesAutocomplete
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      onPlaceSelect={handleGooglePlaceSelect}
                      placeholder="🔍 Google'da ara veya mekan adı yaz (Enter ile ekle)..."
                      disabled={loading || loadingDetails}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  {loadingDetails && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Google'dan bilgiler alınıyor...
                    </div>
                  )}
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    💡 Google'da bulamazsan mekan adını yaz ve{' '}
                    <kbd className="rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                      Enter
                    </kbd>{' '}
                    tuşuna bas
                  </p>
                </div>

                {/* Places List */}
                {places.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={places.map((p) => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {places.map((place, index) => (
                          <SortablePlaceItem
                            key={place.id}
                            place={place}
                            index={index}
                            onRemove={() => handleRemovePlace(place.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Henüz mekan eklenmedi. Yukarıdaki arama kutusunu
                      kullanarak mekan ekle.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex-shrink-0 border-t border-neutral-200 p-4 sm:p-6 dark:border-neutral-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={loading}
                  className="h-11"
                >
                  İptal
                </Button>
                <Button type="submit" disabled={!canSubmit} className="h-11">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? 'Güncelle' : 'Oluştur'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
