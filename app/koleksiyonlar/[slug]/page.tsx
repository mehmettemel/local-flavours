// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CollectionDetailView } from '@/components/collections/collection-detail-view';
import { JsonLd } from '@/components/seo/json-ld';
import { Metadata } from 'next';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

async function getCollection(slug: string) {
  const supabase = await createClient();

 const { data: collection, error } = await supabase
  .from('collections')
  .select(`
    *,
    location:locations(id, names, slug),
    category:categories!collections_category_id_fkey(id, names, slug),
    creator:users(id, username)
  `)
  .eq('slug', slug)
  .single();

  if (error || !collection) return null;

  // Get places in collection
  const { data: collectionPlaces } = await supabase
    .from('collection_places')
    .select(`
      *,
      place:places(
        id,
        slug,
        names,
        descriptions,
        address,
        vote_score,
        vote_count,
        category:categories(id, names)
      )
    `)
    .eq('collection_id', collection.id)
    .order('display_order', { ascending: true });

  return {
    ...collection,
    places: collectionPlaces || [],
  };
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);

  if (!collection) {
    return {
      title: 'Koleksiyon Bulunamadı',
    };
  }

  return {
    title: collection.names?.tr,
    description: collection.descriptions?.tr,
    openGraph: {
      title: collection.names?.tr,
      description: collection.descriptions?.tr,
      type: 'article',
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollection(slug);

  if (!collection) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.names?.tr,
    description: collection.descriptions?.tr,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: collection.places?.map((item: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Restaurant',
          name: item.place?.names?.tr,
          address: item.place?.address,
        },
      })),
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <CollectionDetailView collection={collection} />
    </>
  );
}
