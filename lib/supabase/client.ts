import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Singleton pattern to avoid creating multiple instances
let client: SupabaseClient<Database> | null = null;

export function createClient() {
  if (client) {
    return client;
  }

  // @supabase/ssr handles cookies automatically in the browser
  // Singleton ensures consistent session management across the app
  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      cookies: {
        domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
        path: '/',
        sameSite: 'lax',
      },
    }
  );

  return client;
}

// Helper to reset client (useful for testing or logout)
export function resetClient() {
  client = null;
}
