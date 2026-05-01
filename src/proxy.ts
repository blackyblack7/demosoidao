import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';
import { SESSION_COOKIE_NAME } from '@/constants';

/**
 * Routes that require authentication.
 * Unauthenticated users will be redirected to /login.
 */
const PROTECTED_PATHS = [
  '/dashboard',
  '/admin',
  '/sdservice',
  '/management',
  '/profile',
];

/** Routes only for guests — authenticated users are redirected away. */
const AUTH_ONLY_PATHS = ['/login'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Intercept requests to /uploads/
  // This ensures newly uploaded images are visible without a rebuild
  if (pathname.startsWith('/uploads/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/api/system/serve-image';
    url.searchParams.set('path', pathname);
    return NextResponse.rewrite(url);
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await decrypt(sessionCookie) : null;

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_PATHS.some(p => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the original destination so login can redirect back
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthOnly && session) {
    // Redirect to the appropriate home for each role
    const destination = session.role === 'TEACHER' ? '/management' : '/sdservice';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Update matcher to NOT exclude uploads anymore
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
