import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://localflavours.com';
  const supabase = createClient();

  // Static routes
  const routes = [
    '',
    '/favorites',
    '/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  // Fetch collections
  const { data: collections } = await supabase
    .from('collections')
    .select('slug, updated_at')
    .eq('is_public', true);

  const collectionRoutes = (collections || []).map((collection) => ({
    url: `${baseUrl}/collections/${collection.slug}`,
    lastModified: collection.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, updated_at');

  const profileRoutes = (profiles || []).map((profile) => ({
    url: `${baseUrl}/profile/${profile.username}`,
    lastModified: profile.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...collectionRoutes, ...profileRoutes];
}
