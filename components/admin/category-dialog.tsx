// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
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
import { createClient } from '@/lib/supabase/client';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category?: any;
}

export function CategoryDialog({ isOpen, onClose, category }: CategoryDialogProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const isEditMode = !!category;

  const [formData, setFormData] = useState({
    slug: '',
    nameEn: '',
    nameTr: '',
    icon: '',
    displayOrder: '',
  });

  useEffect(() => {
    if (category) {
      const names = category.names as any;
      setFormData({
        slug: category.slug || '',
        nameEn: names?.en || '',
        nameTr: names?.tr || '',
        icon: category.icon || '',
        displayOrder: category.display_order?.toString() || '',
      });
    } else {
      setFormData({
        slug: '',
        nameEn: '',
        nameTr: '',
        icon: '',
        displayOrder: '',
      });
    }
  }, [category]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const categoryData = {
        slug: data.slug,
        names: {
          en: data.nameEn,
          tr: data.nameTr,
        },
        icon: data.icon,
        display_order: data.displayOrder ? parseInt(data.displayOrder) : 0,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([categoryData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Category' : 'Create New Category'}
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
              placeholder="restaurants"
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
                placeholder="Restaurants"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameTr">Turkish Name</Label>
              <Input
                id="nameTr"
                value={formData.nameTr}
                onChange={(e) => handleChange('nameTr', e.target.value)}
                placeholder="Restoranlar"
              />
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (Lucide icon name)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              placeholder="utensils"
            />
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Use Lucide icon names like: utensils, coffee, beer, shopping-bag
            </p>
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => handleChange('displayOrder', e.target.value)}
              placeholder="1"
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
                  ? 'Update Category'
                  : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
