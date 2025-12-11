
// @ts-nocheck
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Plus, Loader2, MapPin, FolderTree, Star } from 'lucide-react';
import { EditCollectionModal } from '@/components/collections/edit-collection-modal';
import { CollectionCard } from '@/components/collections/collection-card';
import { useAlertDialog } from '@/hooks/use-alert-dialog';

interface Collection {
  id: string;
  slug: string;
  names: { en: string; tr: string };
  descriptions: { en: string; tr: string };
  status: string;
  vote_count: number;
  vote_score: number;
  is_featured: boolean;
  created_at: string;
  location?: { id: string; names: { en: string; tr: string } };
  category?: { id: string; names: { en: string; tr: string } };
  places_count?: number;
}

const ITEMS_PER_PAGE = 9;

function MyCollectionsContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { alert, confirm } = useAlertDialog();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );

  // Get page from URL or default to 1
  const currentPage = Number(searchParams.get('page')) || 1;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/?auth=login');
    }
  }, [authLoading, user, router]);

  // Fetch user's collections
  useEffect(() => {
    if (user) {
      fetchCollections();
    }
  }, [user, currentPage]);

  const fetchCollections = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get total count
      const { count: totalCount, error: countError } = await supabase
        .from('collections')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id);

      if (countError) throw countError;
      setTotalCount(totalCount || 0);

      // Fetch collections with pagination
      const { data: collectionsData, error } = await supabase
        .from('collections')
        .select(
          `
          *,
          location:locations(id, names),
          category:categories!collections_category_id_fkey(id, names)
        `
        )
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      // Get places count for each collection
      const collectionsWithCounts = await Promise.all(
        (collectionsData || []).map(async (collection) => {
          const { count } = await supabase
            .from('collection_places')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collection.id);

          return {
            ...collection,
            places_count: count || 0,
          };
        })
      );

      setCollections(collectionsWithCounts as Collection[]);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm('Bu koleksiyonu silmek istediğinizden emin misiniz?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh list
      fetchCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Koleksiyon silinemedi');
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/koleksiyonlarim?${params.toString()}`);
  };

  if (authLoading || (loading && collections.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Koleksiyonlarım
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Favori mekanlarından koleksiyonlar oluştur ve yönet
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Koleksiyon
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Koleksiyon
              </CardTitle>
              <FolderTree className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Mekan
              </CardTitle>
              <MapPin className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {collections.reduce((sum, c) => sum + (c.places_count || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Öne Çıkan</CardTitle>
              <Star className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {collections.filter((c) => c.is_featured).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderTree className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
              <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Henüz koleksiyon yok
              </h3>
              <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
                Favori mekanlarını listelemek için ilk koleksiyonunu oluştur
              </p>
              <Button onClick={() => setDialogOpen(true)} className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Koleksiyon Oluştur
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onDelete={handleDelete}
                  onEdit={() => {
                    setEditingCollection(collection);
                    setDialogOpen(true);
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    // Show first, last, current, and surrounding pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={page === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        {/* Create/Edit Modal */}
        <EditCollectionModal
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingCollection(null);
          }}
          onSuccess={() => {
            fetchCollections();
            setEditingCollection(null);
          }}
          userId={user.id}
          collection={editingCollection}
        />
    </div>
  );
}

export default function MyCollectionsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    }>
      <MyCollectionsContent />
    </Suspense>
  );
}
