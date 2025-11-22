// @ts-nocheck
'use client';

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
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export default function AdminLocationsPage() {
  const supabase = createClient();

  const { data: locations, isLoading } = useQuery({
    queryKey: ['admin-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('type', { ascending: true })
        .order('slug', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Lokasyonlar
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Türkiye şehir ve ilçelerini görüntüle
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Lokasyonlar ({locations?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-neutral-600 dark:text-neutral-400">
              Lokasyonlar yükleniyor...
            </div>
          ) : locations && locations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İsim</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>İlçeleri Var</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => {
                  const names = location.names as any;
                  const locationName = names?.tr || names?.en || location.slug;

                  return (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{locationName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            location.type === 'country'
                              ? 'default'
                              : location.type === 'city'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {location.type === 'country' ? 'Ülke' : location.type === 'city' ? 'Şehir' : 'İlçe'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {location.slug}
                      </TableCell>
                      <TableCell>
                        {location.has_districts ? 'Evet' : 'Hayır'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-neutral-600 dark:text-neutral-400">
              Lokasyon bulunamadı.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
