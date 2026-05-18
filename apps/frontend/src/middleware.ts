import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  
  // Protected routes that require authentication
  const protectedRoutePrefixes = ['/dashboard', '/profile', '/wallet'];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutePrefixes.some(prefix => pathname.startsWith(prefix));

  // We check for the httpOnly refresh token cookie as a proxy for authentication
  // The actual access token is in memory, but if the refresh token is missing, they are definitely logged out.
  const hasRefreshToken = request.cookies.has('refreshToken');

  if (isProtectedRoute && !hasRefreshToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isPublicRoute && hasRefreshToken) {
    // If they are logged in and try to access login/register, send them to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
