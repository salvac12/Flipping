import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';

export default auth((req) => {
  // Permitir acceso sin autenticación - middleware desactivado temporalmente
  return NextResponse.next();
});

// Proteger solo rutas de scraper (dashboard ahora es público)
export const config = {
  matcher: [
    '/api/scraper',
    '/api/scraper/:path*',
  ],
};
