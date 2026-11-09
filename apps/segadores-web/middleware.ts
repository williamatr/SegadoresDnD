import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Middleware de Next.js en el Edge.
 * 1. Refresca automáticamente la sesión de Supabase Auth mediante cookies seguras.
 * 2. Protege rutas privadas (/portal, /personajes/*).
 * 3. Valida la lista blanca (Allowlist):
 *    - Fuente principal: existencia del jugador en la tabla `public.players`.
 *    - Fallback / bootstrap: variable de entorno `ALLOWED_EMAILS`.
 * 4. Rutas públicas (/, /demo, /hechizos, /login, /auth/*, /acceso-denegado) nunca son bloqueadas.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Refrescar la sesión criptográfica con Supabase Auth (getUser)
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // 2. Determinar si la ruta actual es privada y requiere control de acceso
  const isProtectedRoute = pathname.startsWith('/portal') || pathname.startsWith('/personajes');

  if (!isProtectedRoute) {
    return supabaseResponse;
  }

  // Soporte para sesión de desarrollo local (exclusivo para localhost / NODE_ENV === 'development')
  if (process.env.NODE_ENV === 'development') {
    const devSession = request.cookies.get('segadores_dev_session')?.value;
    if (devSession) {
      return supabaseResponse;
    }
  }

  // 3. Usuario no autenticado -> Redirigir a /login conservando la URL de destino (?next=...)
  if (!user || !user.email) {
    const loginUrl = new URL('/login', request.url);
    const returnUrl = pathname + search;
    loginUrl.searchParams.set('next', returnUrl);
    return NextResponse.redirect(loginUrl);
  }

  const userEmail = user.email.trim().toLowerCase();

  // 4. Validación de lista blanca (Allowlist) y Super-Admin DM
  // Estrategia:
  //   - Super-Admin / DM Principal: Presencia en `ADMIN_EMAILS` (acceso y permisos totales inmediatos)
  //   - Primer orden (Fuente de verdad): Registro existente en `public.players`
  //   - Segundo orden (Bootstrap / Fallback): Presencia en `ALLOWED_EMAILS`
  let isAuthorized = false;

  // Paso 4A: Super-Admin DM vía variable de entorno ADMIN_EMAILS
  const rawAdmin = process.env.ADMIN_EMAILS || process.env.DM_EMAILS || '';
  const adminList = rawAdmin
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminList.includes(userEmail)) {
    isAuthorized = true;
  }

  // Paso 4B: Consulta a public.players (permitido por RLS para usuarios autenticados)
  if (!isAuthorized && supabase) {
    try {
      const { data: player, error } = await supabase
        .from('players')
        .select('id, email')
        .eq('email', userEmail)
        .maybeSingle();

      if (!error && player) {
        isAuthorized = true;
      }
    } catch (err) {
      console.warn('[middleware] Error al verificar public.players, recurriendo a ALLOWED_EMAILS:', err);
    }
  }

  // Paso 4C: Validación contra la variable de entorno ALLOWED_EMAILS
  if (!isAuthorized) {
    const rawAllowed = process.env.ALLOWED_EMAILS || '';
    const allowedList = rawAllowed
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    if (allowedList.includes(userEmail)) {
      isAuthorized = true;
    }
  }

  // 5. Usuario autenticado pero NO autorizado en la lista blanca -> Redirigir a vista 403
  if (!isAuthorized) {
    const deniedUrl = new URL('/acceso-denegado', request.url);
    return NextResponse.redirect(deniedUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Ejecutar el middleware en todas las rutas excepto:
     * - _next/static (archivos estáticos compilados)
     * - _next/image (imágenes optimizadas de Next.js)
     * - favicon.ico (icono de favoritos)
     * - Archivos con extensión estática (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico, .txt, .xml)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
