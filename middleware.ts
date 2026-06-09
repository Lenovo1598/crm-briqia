import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from './lib/auth';

// Rutas públicas (sin protección)
const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/chat'];
const PUBLIC_PREFIXES = ['/api/demo/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Permitir prefijos públicos (demo)
  if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Rutas privadas: verificar JWT
  if (pathname.startsWith('/api/') || pathname.startsWith('/dashboard') || pathname === '/') {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    // Si no hay token en header (para API routes)
    if (pathname.startsWith('/api/')) {
      if (!token) {
        return NextResponse.json(
          { error: 'No autorizado. Se requiere JWT en header Authorization' },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { error: 'Token inválido o expirado' },
          { status: 401 }
        );
      }

      // Agregar user al request para que los handlers lo usen
      const response = NextResponse.next();
      response.headers.set('x-user-id', decoded.id.toString());
      response.headers.set('x-user-role', decoded.role);
      return response;
    }

    // Para rutas UI: verificar token en localStorage (será verificado en cliente)
    // El middleware aquí solo valida API calls
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
