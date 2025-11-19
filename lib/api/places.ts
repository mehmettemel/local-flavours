// @ts-nocheck
import { createClient } from '../supabase/server';
import { Database } from '@/types/database';

export type Place = Database['public']['Tables']['places']['Row'];

export async function getPlacesByLocation(locationId: string, limit = 20, categorySlug?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('places')
    .select(`
      *,
      category:categories(*),
      location:locations(*)
    `)
    .eq('location_id', locationId)
    .eq('status', 'approved');

  // If category filter is provided, join with categories and filter
  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (category) {
      query = query.eq('category_id', category.id);
    }
  }

  const { data, error } = await query
    .order('vote_score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getPlacesByLocationAndCategory(
  locationId: string,
  categoryId: string,
  limit = 20
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      category:categories(*),
      location:locations(*)
    `)
    .eq('location_id', locationId)
    .eq('category_id', categoryId)
    .eq('status', 'approved')
    .order('vote_score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getPlaceBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      category:categories(*),
      location:locations(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllPlaces(limit = 100, offset = 0) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      category:categories(*),
      location:locations(*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

export async function getTopPlacesByCity(citySlug: string, limit = 5) {
  const supabase = await createClient();

  // First get the city
  const { data: city } = await supabase
    .from('locations')
    .select('id')
    .eq('slug', citySlug)
    .eq('type', 'city')
    .single();

  if (!city) return [];

  // Then get top places
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      category:categories(*),
      location:locations(*)
    `)
    .eq('location_id', city.id)
    .eq('status', 'approved')
    .order('vote_score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
