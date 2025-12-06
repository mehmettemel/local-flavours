
import { createClient } from '../supabase/server';
import { Database } from '@/types/database';

export type Category = Database['public']['Tables']['categories']['Row'];

export async function getAllCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');

  if (error) throw error;
  return data;
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get categories with optional filters
 */
export async function getCategories(params?: {
  parent_id?: string | null;
  limit?: number;
  offset?: number;
}): Promise<Category[]> {
  const supabase = await createClient();

  let query = supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  // Filter by parent_id (null for main categories)
  if (params?.parent_id !== undefined) {
    if (params.parent_id === null) {
      query = query.is('parent_id', null);
    } else {
      query = query.eq('parent_id', params.parent_id);
    }
  }

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  if (params?.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
}
