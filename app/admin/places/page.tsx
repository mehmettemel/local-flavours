// @ts-nocheck
'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export default function AdminPlacesPage() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: places, isLoading } = useQuery({
    queryKey: ['admin-places'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          categories:category_id(*),
          locations:location_id(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (placeId: string) => {
      const { error } = await supabase.from('places').delete().eq('id', placeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-places'] });
    },
  });

  const handleDelete = async (placeId: string) => {
    if (confirm('Bu mekanı silmek istediğinizden emin misiniz?')) {
      deleteMutation.mutate(placeId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Mekanlar
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Koleksiyonlardan eklenen mekanları görüntüle ve yönet
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Mekanlar ({places?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-neutral-600 dark:text-neutral-400">
              Mekanlar yükleniyor...
            </div>
          ) : places && places.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İsim</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Lokasyon</TableHead>
                  <TableHead>Google ID</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {places.map((place) => {
                  const names = place.names as any;
                  const placeName = names?.tr || names?.en || place.slug;

                  return (
                    <TableRow key={place.id}>
                      <TableCell className="font-medium">{placeName}</TableCell>
                      <TableCell>
                        {place.categories?.slug || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {place.locations?.slug || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {place.google_place_id ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            Google
                          </Badge>
                        ) : (
                          <span className="text-xs text-neutral-500">Text</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            place.status === 'approved'
                              ? 'default'
                              : place.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {place.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(place.id)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-neutral-600 dark:text-neutral-400">
              Henüz mekan eklenmemiş. Mekanlar koleksiyonlar aracılığıyla eklenir.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
