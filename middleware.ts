import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Create Supabase client for middleware
  const supabase = await createClient(request);

  // 2. Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 3. Protected routes that require authentication
  const protectedPaths = [
    '/koleksiyonlarim',
    '/favoriler',
    '/ayarlar',
  ];

  // 4. Admin routes
  const adminPaths = ['/admin'];

  // 5. Check if current path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

  // 6. Redirect to login if accessing protected route without session
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('auth', 'login');
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 7. Check admin role for admin routes
  if (isAdminPath) {
    if (!session) {
      const redirectUrl = new URL('/', request.url);
      redirectUrl.searchParams.set('auth', 'login');
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      // Redirect non-admin users to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 8. Continue with request
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder files (images, etc)
     * - api routes (they handle their own auth)
     * - auth routes (to prevent redirect loops)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)|api|auth).*)',
  ],
};
