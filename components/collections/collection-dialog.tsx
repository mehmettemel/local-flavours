// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { Loader2, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCities } from '@/lib/hooks/use-locations';
import {
  collectionFormSchema,
  type CollectionFormValues,
  parseTags,
  formatTags,
} from '@/lib/validations/collection';

interface CollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
  collection?: any;
}

export function CollectionDialog({
  open,
  onOpenChange,
  onSuccess,
  userId,
  collection,
}: CollectionDialogProps) {
  const supabase = createClient();
  const isEdit = !!collection;

  // TanStack Query hooks
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: '',
      description: '',
      locationId: '',
      categoryId: '',
      tags: '',
    },
  });

  // Load existing collection data for editing
  useEffect(() => {
    if (collection && open) {
      reset({
        name: collection.names?.tr || '',
        description: collection.descriptions?.tr || '',
        locationId: collection.location_id || '',
        categoryId: collection.category_id || '',
        tags: formatTags(collection.tags || []),
      });
    } else if (!open) {
      reset();
    }
  }, [collection, open, reset]);

  // Generate slug helper
  const generateSlug = (name: string) => {
    const turkishMap: Record<string, string> = {
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

    return name
      .split('')
      .map((char) => turkishMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Form submit handler
  const onSubmit = async (data: CollectionFormValues) => {
    try {
      const slug = isEdit
        ? collection.slug
        : generateSlug(data.name) +
          '-' +
          Math.random().toString(36).substring(2, 6);

      const collectionData = {
        slug,
        names: { tr: data.name, en: data.name },
        descriptions: { tr: data.description || '', en: data.description || '' },
        creator_id: userId,
        location_id: data.locationId,
        category_id: data.categoryId,
        subcategory_id: null,
        tags: parseTags(data.tags || ''),
        status: 'active',
      };

      if (isEdit) {
        const { slug: _, ...updateData } = collectionData;
        const { error } = await supabase
          .from('collections')
          .update(updateData)
          .eq('id', collection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('collections')
          .insert([collectionData]);

        if (error) throw error;
      }

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      console.error('Error saving collection:', error);
      alert(error.message || 'Koleksiyon kaydedilemedi');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl max-h-[90vh] w-full overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? 'Koleksiyonu Düzenle' : 'Yeni Koleksiyon Oluştur'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isEdit
              ? 'Koleksiyon bilgilerini güncelleyin'
              : 'Favori mekanlarınızdan yeni bir koleksiyon oluşturun'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Grid layout for responsive form */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Collection Name */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name" className="text-base font-semibold">
                Koleksiyon Adı <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Örn: İstanbul'daki En İyi Kahve Dükkanları"
                className="h-11 text-base"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                URL otomatik oluşturulacak
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Açıklama
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Koleksiyonunuz hakkında kısa bir açıklama yazın..."
                className="min-h-[100px] resize-none text-base"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* City Selection */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-base font-semibold">
                Şehir <span className="text-red-500">*</span>
              </Label>
              <Combobox
                options={cities.map((city) => ({
                  value: city.id,
                  label: city.names.tr,
                }))}
                value={watch('locationId')}
                onValueChange={(value) => setValue('locationId', value)}
                placeholder="Şehir seçin..."
                searchPlaceholder="Şehir ara..."
                emptyText="Şehir bulunamadı."
                disabled={isSubmitting || citiesLoading}
                className="h-11"
              />
              {errors.locationId && (
                <p className="text-sm text-red-500">
                  {errors.locationId.message}
                </p>
              )}
            </div>

            {/* Category Selection */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category" className="text-base font-semibold">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Combobox
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.names.tr,
                }))}
                value={watch('categoryId')}
                onValueChange={(value) => setValue('categoryId', value)}
                placeholder="Kategori seçin..."
                searchPlaceholder="Kategori ara..."
                emptyText="Kategori bulunamadı."
                disabled={isSubmitting || categoriesLoading}
                className="h-11"
              />
              {errors.categoryId && (
                <p className="text-sm text-red-500">
                  {errors.categoryId.message}
                </p>
              )}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                Bu koleksiyondaki mekanların türünü belirtin
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tags" className="text-base font-semibold">
                Etiketler
              </Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="kahve, kahvaltı, samimi (virgülle ayırın)"
                className="h-11 text-base"
                disabled={isSubmitting}
              />
              {errors.tags && (
                <p className="text-sm text-red-500">{errors.tags.message}</p>
              )}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                Birden fazla etiket için virgül kullanın
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-11 text-base"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 text-base"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
