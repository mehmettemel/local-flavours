// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { CitySelect } from '@/components/ui/city-select';

interface PlaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  place?: any;
}

export function PlaceDialog({ isOpen, onClose, place }: PlaceDialogProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const isEditMode = !!place;

  const [formData, setFormData] = useState({
    slug: '',
    nameEn: '',
    nameTr: '',
    descriptionEn: '',
    descriptionTr: '',
    address: '',
    googleMapsUrl: '',
    cityName: '', // City name for the CitySelect component
    locationId: '',
    categoryId: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    imageUrl: '',
  });

  // Fetch locations
  const { data: locations } = useQuery({
    queryKey: ['admin-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('type', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (place) {
      const names = place.names as any;
      const descriptions = place.descriptions as any;

      // Get city name from location
      let cityName = '';
      if (place.location_id && locations) {
        const location = locations.find(loc => loc.id === place.location_id);
        if (location && location.type === 'city') {
          const locNames = location.names as any;
          cityName = locNames?.tr || '';
        }
      }

      setFormData({
        slug: place.slug || '',
        nameEn: names?.en || '',
        nameTr: names?.tr || '',
        descriptionEn: descriptions?.en || '',
        descriptionTr: descriptions?.tr || '',
        address: place.address || '',
        googleMapsUrl: place.google_maps_url || '',
        cityName,
        locationId: place.location_id || '',
        categoryId: place.category_id || '',
        status: place.status || 'pending',
        imageUrl: place.images?.[0] || '',
      });
    } else {
      setFormData({
        slug: '',
        nameEn: '',
        nameTr: '',
        descriptionEn: '',
        descriptionTr: '',
        address: '',
        googleMapsUrl: '',
        cityName: '',
        locationId: '',
        categoryId: '',
        status: 'pending',
        imageUrl: '',
      });
    }
  }, [place, locations]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Get or create location ID from city name
      let finalLocationId = data.locationId;
      if (data.cityName && !finalLocationId) {
        // Find location by city name
        const location = locations?.find(loc => {
          const locNames = loc.names as any;
          return locNames?.tr === data.cityName && loc.type === 'city';
        });

        if (location) {
          finalLocationId = location.id;
        } else {
          // Create new city location if it doesn't exist
          const slug = data.cityName
            .toLowerCase()
            .replace(/ç/g, 'c')
            .replace(/ğ/g, 'g')
            .replace(/ı/g, 'i')
            .replace(/İ/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ş/g, 's')
            .replace(/ü/g, 'u')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          const { data: newLocation, error: locError } = await supabase
            .from('locations')
            .insert({
              slug,
              type: 'city',
              names: { tr: data.cityName, en: data.cityName },
              path: `/turkey/${slug}`,
            })
            .select()
            .single();

          if (locError) throw locError;
          finalLocationId = newLocation.id;
        }
      }

      const placeData = {
        slug: data.slug,
        names: {
          en: data.nameEn,
          tr: data.nameTr,
        },
        descriptions: {
          en: data.descriptionEn,
          tr: data.descriptionTr,
        },
        address: data.address,
        google_maps_url: data.googleMapsUrl || null,
        location_id: finalLocationId,
        category_id: data.categoryId,
        status: data.status,
        images: data.imageUrl ? [data.imageUrl] : [],
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('places')
          .update(placeData)
          .eq('id', place.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('places').insert([placeData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-places'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Place' : 'Create New Place'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="karakoy-lokantasi"
              required
            />
          </div>

          {/* Names */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Names</h3>
            <div className="space-y-2">
              <Label htmlFor="nameEn">English Name *</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => handleChange('nameEn', e.target.value)}
                placeholder="Karaköy Lokantası"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameTr">Turkish Name</Label>
              <Input
                id="nameTr"
                value={formData.nameTr}
                onChange={(e) => handleChange('nameTr', e.target.value)}
                placeholder="Karaköy Lokantası"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Descriptions</h3>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">English Description *</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => handleChange('descriptionEn', e.target.value)}
                placeholder="Traditional Turkish restaurant..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionTr">Turkish Description</Label>
              <Textarea
                id="descriptionTr"
                value={formData.descriptionTr}
                onChange={(e) => handleChange('descriptionTr', e.target.value)}
                placeholder="Geleneksel Türk restoranı..."
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Kemankeş Karamustafa Paşa, Karaköy"
              required
            />
          </div>

          {/* Google Maps URL */}
          <div className="space-y-2">
            <Label htmlFor="googleMapsUrl">Google Maps Link</Label>
            <Input
              id="googleMapsUrl"
              type="url"
              value={formData.googleMapsUrl}
              onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
              placeholder="https://maps.google.com/..."
            />
            <p className="text-xs text-neutral-500">
              Google Maps'ten mekanın linkini kopyalayıp buraya yapıştırın
            </p>
          </div>

          {/* Location (City) */}
          <div className="space-y-2">
            <Label htmlFor="location">Şehir (City) *</Label>
            <CitySelect
              value={formData.cityName}
              onValueChange={(value) => {
                handleChange('cityName', value);
                // Try to find matching location ID
                const location = locations?.find(loc => {
                  const locNames = loc.names as any;
                  return locNames?.tr === value && loc.type === 'city';
                });
                if (location) {
                  handleChange('locationId', location.id);
                } else {
                  handleChange('locationId', '');
                }
              }}
              placeholder="Şehir ara ve seç..."
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => handleChange('categoryId', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => {
                  const names = category.names as any;
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      {names?.en || category.slug}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => handleChange('status', value)}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? 'Saving...'
                : isEditMode
                  ? 'Update Place'
                  : 'Create Place'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
