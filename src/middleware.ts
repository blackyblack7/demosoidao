import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept requests to /uploads/
  if (pathname.startsWith('/uploads/')) {
    // We rewrite the request to our dynamic image serving API
    // This only happens if Next.js doesn't serve the file directly from the static public folder
    const url = request.nextUrl.clone();
    url.pathname = '/api/system/serve-image';
    url.searchParams.set('path', pathname);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// Config to match only the paths we care about
export const config = {
  matcher: [
    '/uploads/:path*',
  ],
};
