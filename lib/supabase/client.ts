import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [key, value] = cookie.trim().split('=');
            if (key === name) {
              return decodeURIComponent(value);
            }
          }
          return null;
        },
        set(name: string, value: string, options: any) {
          document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${options.maxAge || 31536000}; ${options.sameSite ? `SameSite=${options.sameSite}` : 'SameSite=Lax'}`;
        },
        remove(name: string, options: any) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        },
      },
    }
  );
}
