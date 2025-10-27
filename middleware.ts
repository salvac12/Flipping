import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Si no está autenticado y está en ruta protegida, redirigir al login
  if (!isLoggedIn) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

// Proteger rutas del dashboard
export const config = {
  matcher: ['/dashboard/:path*', '/api/properties/:path*', '/api/scraper/:path*'],
};
