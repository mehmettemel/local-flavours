// @ts-nocheck
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
