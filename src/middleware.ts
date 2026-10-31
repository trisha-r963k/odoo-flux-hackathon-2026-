import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    // 1. Admin views (/admin/*) restricted strictly to ADMIN
    if (path.startsWith('/admin')) {
      if (role !== 'ADMIN') {
        // Unauthorized role access
        if (role === 'STAFF') {
          return NextResponse.redirect(new URL('/staff/subscriptions', req.url));
        }
        return NextResponse.redirect(new URL('/portal/subscriptions', req.url));
      }
    }

    // 2. Staff views (/staff/*) restricted to ADMIN and STAFF
    if (path.startsWith('/staff')) {
      if (role !== 'ADMIN' && role !== 'STAFF') {
        return NextResponse.redirect(new URL('/portal/subscriptions', req.url));
      }
    }

    // 3. Customer portal views (/portal/*) accessible to CUSTOMER (and ADMIN for testing)
    if (path.startsWith('/portal')) {
      if (!role) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public paths don't require authentication
        if (
          path.startsWith('/login') ||
          path.startsWith('/register') ||
          path.startsWith('/forgot-password') ||
          path.startsWith('/reset-password') ||
          path.startsWith('/api/auth') ||
          path.startsWith('/css') ||
          path.startsWith('/js') ||
          path.startsWith('/images') ||
          path.startsWith('/diagrams') ||
          path === '/' ||
          path === '/favicon.ico'
        ) {
          return true;
        }

        // Protected paths require a valid session token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/portal/:path*',
  ],
};
