import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Route Handler para cerrar la sesión del usuario (/auth/signout).
 * Revoca la sesión en Supabase y limpia las cookies de autenticación,
 * redirigiendo al usuario a la página de inicio (/) con código HTTP 303 (See Other).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('[auth/signout] Error durante el cierre de sesión:', err);
  }

  const origin = request.nextUrl.origin;
  const response = NextResponse.redirect(`${origin}/`, { status: 303 });
  response.cookies.delete('segadores_dev_session');
  return response;
}
