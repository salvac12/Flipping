import { auth } from '@/lib/auth/auth-options';

export default auth((req) => {
  // El middleware de auth automáticamente protege las rutas
  // Solo permite acceso si el usuario está autenticado
});

// Proteger rutas del dashboard
export const config = {
  matcher: ['/dashboard/:path*', '/api/properties/:path*', '/api/scraper/:path*'],
};
