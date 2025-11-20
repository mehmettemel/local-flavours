import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface Category {
  id: string;
  slug: string;
  names: { tr: string; en: string };
  icon: string;
  display_order: number;
  parent_id: string | null;
}

/**
 * Fetch all categories (flat structure - no parent-child hierarchy)
 */
export function useCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data as Category[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
