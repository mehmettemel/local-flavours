import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

// Protected routes that require authentication
const protectedRoutes = [
  '/my-collections',
  '/favorites',
  '/settings',
  '/profile/edit',
];

// Admin-only routes
const adminRoutes = ['/admin'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle internationalization first
  let response = intlMiddleware(request);

  // Handle Supabase session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if route is protected and user is not authenticated
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.includes(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.includes(route));

  if ((isProtectedRoute || isAdminRoute) && !user) {
    // Redirect to home with auth modal flag
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('auth', 'login');
    return NextResponse.redirect(redirectUrl);
  }

  // Check admin access
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
      // Redirect non-admin users
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(tr|en)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
