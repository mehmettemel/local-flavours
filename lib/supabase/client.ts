import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // @supabase/ssr handles cookies automatically in the browser
  // No need for custom cookie handlers
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
