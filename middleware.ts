export { default } from 'next-auth/middleware';

// Proteger rutas del dashboard
export const config = {
  matcher: ['/dashboard/:path*', '/api/properties/:path*', '/api/scraper/:path*'],
};
