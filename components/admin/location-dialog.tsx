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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';

interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  location?: any;
}

export function LocationDialog({ isOpen, onClose, location }: LocationDialogProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const isEditMode = !!location;

  const [formData, setFormData] = useState({
    slug: '',
    nameEn: '',
    nameTr: '',
    type: 'city' as 'country' | 'city' | 'district',
    parentId: '',
    hasDistricts: false,
    latitude: '',
    longitude: '',
  });

  // Fetch parent locations (for cities/districts)
  const { data: parentLocations } = useQuery({
    queryKey: ['parent-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('type', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (location) {
      const names = location.names as any;
      setFormData({
        slug: location.slug || '',
        nameEn: names?.en || '',
        nameTr: names?.tr || '',
        type: location.type || 'city',
        parentId: location.parent_id || '',
        hasDistricts: location.has_districts || false,
        latitude: location.latitude?.toString() || '',
        longitude: location.longitude?.toString() || '',
      });
    } else {
      setFormData({
        slug: '',
        nameEn: '',
        nameTr: '',
        type: 'city',
        parentId: '',
        hasDistricts: false,
        latitude: '',
        longitude: '',
      });
    }
  }, [location]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const locationData = {
        slug: data.slug,
        names: {
          en: data.nameEn,
          tr: data.nameTr,
        },
        type: data.type,
        parent_id: data.parentId || null,
        has_districts: data.hasDistricts,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('locations')
          .update(locationData)
          .eq('id', location.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('locations').insert([locationData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
      queryClient.invalidateQueries({ queryKey: ['parent-locations'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Location' : 'Create New Location'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => handleChange('type', value)}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="district">District</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Parent Location (for cities/districts) */}
          {formData.type !== 'country' && (
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Location *</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => handleChange('parentId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent>
                  {parentLocations
                    ?.filter((loc) => {
                      if (formData.type === 'city') return loc.type === 'country';
                      if (formData.type === 'district') return loc.type === 'city';
                      return false;
                    })
                    .map((loc) => {
                      const names = loc.names as any;
                      return (
                        <SelectItem key={loc.id} value={loc.id}>
                          {names?.en || loc.slug}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="istanbul"
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
                placeholder="Istanbul"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameTr">Turkish Name</Label>
              <Input
                id="nameTr"
                value={formData.nameTr}
                onChange={(e) => handleChange('nameTr', e.target.value)}
                placeholder="İstanbul"
              />
            </div>
          </div>

          {/* Has Districts (for cities) */}
          {formData.type === 'city' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasDistricts"
                checked={formData.hasDistricts}
                onChange={(e) => handleChange('hasDistricts', e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300"
              />
              <Label htmlFor="hasDistricts">Has Districts</Label>
            </div>
          )}

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
                placeholder="41.0082"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                placeholder="28.9784"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? 'Saving...'
                : isEditMode
                  ? 'Update Location'
                  : 'Create Location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
