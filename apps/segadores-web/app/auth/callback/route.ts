import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Route Handler para el intercambio de código OAuth de Supabase Auth (/auth/callback).
 * 1. Intercambia `code` por sesión de Supabase Auth y persiste cookies.
 * 2. Valida la URL de retorno `next` contra open redirects.
 * 3. Sincroniza el usuario en `public.players`:
 *    - Si ya existe por email, vincula `auth_user_id` con el cliente admin.
 *    - Si no existe pero está en `ALLOWED_EMAILS`, crea la fila con role 'player' (nunca 'dm').
 *    - Si no está autorizado, redirige a /acceso-denegado.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const origin = requestUrl.origin;

  // Validación estricta anti-open-redirect: solo rutas relativas que comiencen por / y no por //
  let targetPath = '/portal';
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    targetPath = next;
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(`${origin}/login?error=missing_credentials`);
  }

  let response = NextResponse.redirect(`${origin}${targetPath}`);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.redirect(`${origin}${targetPath}`);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[auth/callback] Error al intercambiar código OAuth:', exchangeError);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
  }

  const user = exchangeData?.user;
  if (!user || !user.email) {
    return NextResponse.redirect(`${origin}/login?error=no_email`);
  }

  const email = user.email.trim().toLowerCase();

  // Sincronización en public.players mediante cliente administrativo (bypassa RLS)
  try {
    const admin = createAdminClient();

    // Comprobar si el usuario es Super-Admin / Master DM vía variables de entorno
    const rawAdmin = process.env.ADMIN_EMAILS || process.env.DM_EMAILS || '';
    const adminList = rawAdmin
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    const isSuperDm = adminList.includes(email);

    // 1. Verificar si existe registro previo en public.players
    const { data: existingPlayer, error: fetchError } = await admin
      .from('players')
      .select('id, auth_user_id, email, display_name, role')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) {
      console.warn('[auth/callback] Advertencia al buscar jugador en public.players:', fetchError.message);
    }

    if (existingPlayer) {
      // Actualizaciones requeridas (auth_user_id o rol de DM para administradores)
      const updates: { auth_user_id?: string; role?: 'dm' | 'player' } = {};
      if (!existingPlayer.auth_user_id || existingPlayer.auth_user_id !== user.id) {
        updates.auth_user_id = user.id;
      }
      if (isSuperDm && existingPlayer.role !== 'dm') {
        updates.role = 'dm';
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await admin
          .from('players')
          .update(updates)
          .eq('id', existingPlayer.id);

        if (updateError) {
          console.error('[auth/callback] Error al actualizar public.players:', updateError);
        }
      }
    } else {
      // 2. Si no existe en public.players, validar si es Super DM o si está en ALLOWED_EMAILS
      const rawAllowed = process.env.ALLOWED_EMAILS || '';
      const allowedList = rawAllowed
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

      if (isSuperDm || allowedList.includes(email)) {
        const meta = user.user_metadata || {};
        const displayName =
          meta.full_name ||
          meta.name ||
          meta.custom_claims?.name ||
          email.split('@')[0];

        // Si está en ADMIN_EMAILS se le asigna rol 'dm'; si viene solo por ALLOWED_EMAILS siempre es 'player'
        const assignedRole: 'dm' | 'player' = isSuperDm ? 'dm' : 'player';

        const { error: insertError } = await admin
          .from('players')
          .insert({
            auth_user_id: user.id,
            email,
            display_name: displayName.slice(0, 100),
            role: assignedRole,
          });

        if (insertError) {
          console.error('[auth/callback] Error al registrar jugador de lista blanca / DM:', insertError);
        }
      } else {
        // El usuario está autenticado pero no figura en public.players, ADMIN_EMAILS ni ALLOWED_EMAILS
        const deniedResponse = NextResponse.redirect(`${origin}/acceso-denegado`);
        // Transferir cookies de sesión para que el usuario pueda hacer signout
        response.cookies.getAll().forEach(cookie => {
          deniedResponse.cookies.set(cookie.name, cookie.value);
        });
        return deniedResponse;
      }
    }
  } catch (adminErr) {
    console.error('[auth/callback] Excepción en sincronización administrativa:', adminErr);
  }

  return response;
}
