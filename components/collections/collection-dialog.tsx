'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface CollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
  collection?: any; // For editing
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

  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Form state
  const [slug, setSlug] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameTr, setNameTr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descTr, setDescTr] = useState('');
  const [locationId, setLocationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');

  // Load form data when editing
  useEffect(() => {
    if (collection) {
      setSlug(collection.slug || '');
      setNameEn(collection.names?.en || '');
      setNameTr(collection.names?.tr || '');
      setDescEn(collection.descriptions?.en || '');
      setDescTr(collection.descriptions?.tr || '');
      setLocationId(collection.location_id || '');
      setCategoryId(collection.category_id || '');
      setTags(collection.tags?.join(', ') || '');
    }
  }, [collection]);

  // Fetch locations and categories
  useEffect(() => {
    if (open) {
      fetchLocations();
      fetchCategories();
    }
  }, [open]);

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('id, slug, names')
      .eq('type', 'city')
      .order('names->en');

    setLocations(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, slug, names')
      .is('parent_id', null)
      .order('names->en');

    setCategories(data || []);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameEnChange = (value: string) => {
    setNameEn(value);
    if (!isEdit && !slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !nameEn || !nameTr || !locationId || !categoryId) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const collectionData = {
        slug,
        names: { en: nameEn, tr: nameTr },
        descriptions: { en: descEn, tr: descTr },
        creator_id: userId,
        location_id: locationId,
        category_id: categoryId,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        status: 'active',
      };

      if (isEdit) {
        const { error } = await supabase
          .from('collections')
          .update(collectionData)
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
      resetForm();
    } catch (error: any) {
      console.error('Error saving collection:', error);
      alert(error.message || 'Failed to save collection');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSlug('');
    setNameEn('');
    setNameTr('');
    setDescEn('');
    setDescTr('');
    setLocationId('');
    setCategoryId('');
    setTags('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Collection' : 'Create Collection'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update your collection details'
              : 'Create a new curated collection of places'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="best-coffee-shops"
              disabled={loading}
              required
            />
          </div>

          {/* Name EN */}
          <div className="space-y-2">
            <Label htmlFor="name-en">
              Name (English) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name-en"
              value={nameEn}
              onChange={(e) => handleNameEnChange(e.target.value)}
              placeholder="Best Coffee Shops in Istanbul"
              disabled={loading}
              required
            />
          </div>

          {/* Name TR */}
          <div className="space-y-2">
            <Label htmlFor="name-tr">
              Name (Turkish) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name-tr"
              value={nameTr}
              onChange={(e) => setNameTr(e.target.value)}
              placeholder="İstanbul'daki En İyi Kahve Dükkanları"
              disabled={loading}
              required
            />
          </div>

          {/* Description EN */}
          <div className="space-y-2">
            <Label htmlFor="desc-en">Description (English)</Label>
            <Textarea
              id="desc-en"
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              placeholder="My favorite coffee spots in the city..."
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Description TR */}
          <div className="space-y-2">
            <Label htmlFor="desc-tr">Description (Turkish)</Label>
            <Textarea
              id="desc-tr"
              value={descTr}
              onChange={(e) => setDescTr(e.target.value)}
              placeholder="Şehirdeki favori kahve mekanlarım..."
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            <Select value={locationId} onValueChange={setLocationId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.names.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.names.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="coffee, breakfast, cozy (comma separated)"
              disabled={loading}
            />
            <p className="text-xs text-neutral-500">
              Separate multiple tags with commas
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
