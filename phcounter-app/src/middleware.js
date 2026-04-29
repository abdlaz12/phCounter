// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('phcounter_token');
  const { pathname } = req.nextUrl;

  const protectedRoutes = ['/dashboard', '/batches', '/notifications', '/profile'];
  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/batches/:path*', '/notifications/:path*', '/profile/:path*'],
};