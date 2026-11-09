import { NextResponse, type NextRequest } from 'next/server';

/**
 * Route Handler para inicio de sesión rápido en entorno de desarrollo local (/api/auth/dev-login).
 * Permite al DM y desarrollador probar las perspectivas de cualquier jugador o del DM
 * sin necesidad de configurar credenciales de Google OAuth en la nube durante el desarrollo.
 */
export async function GET(request: NextRequest) {
  // Prohibir terminantemente el bypass de desarrollo en entornos de producción
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not Found', { status: 404 });
  }

  const role = request.nextUrl.searchParams.get('role') || 'dm';
  const next = request.nextUrl.searchParams.get('next') || '/portal';
  const origin = request.nextUrl.origin;

  const targetPath = next.startsWith('/') && !next.startsWith('//') ? next : '/portal';
  const response = NextResponse.redirect(`${origin}${targetPath}`);

  // Persistir la sesión de desarrollo en cookie
  response.cookies.set('segadores_dev_session', role, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 días
  });

  return response;
}
