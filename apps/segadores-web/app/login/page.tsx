'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shield, AlertTriangle, ArrowLeft, Sparkles, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TaperedRule, DndBadge } from '@segadores/ui';

function LoginForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const errorParam = searchParams.get('error');
  const nextParam = searchParams.get('next');

  // Validación estricta anti-open-redirect: solo rutas relativas que inicien con / y no con //
  const sanitizeNextPath = (target: string | null): string => {
    if (!target) return '/portal';
    if (target.startsWith('/') && !target.startsWith('//')) {
      return target;
    }
    return '/portal';
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setClientError(null);

      const supabase = createClient();
      const safeNext = sanitizeNextPath(nextParam);
      const rawOrigin = window.location.origin;
      const canonicalOrigin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (rawOrigin.includes('vercel.app') ? 'https://www.segadoresdnd.com' : rawOrigin);
      const redirectTo = `${canonicalOrigin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setClientError(error.message);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado durante la autenticación.';
      setClientError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-10 rounded-sm bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] dnd-notched shadow-2xl text-center space-y-6">
      <div className="mx-auto w-14 h-14 rounded-sm bg-[#58180D] border-2 border-[#c29b38] flex items-center justify-center text-[#c29b38] shadow-md shadow-black/30">
        <Shield className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wider text-[#58180D] font-dnd-title uppercase">
          Portal de Campaña
        </h1>
        <p className="text-xs sm:text-sm text-[#58544d] font-dnd-body leading-relaxed">
          Inicia sesión con tu cuenta autorizada de Google para ingresar a las crónicas y fichas de <strong className="text-[#58180D] font-dnd-title">Segadores de Orcos</strong>.
        </p>
        <TaperedRule variant="crimson" />
      </div>

      {/* Banner de Invitación de Mesa */}
      {searchParams.get('invited') === 'true' && (
        <div className="p-4 rounded-sm bg-[#ede2cb] border border-[#c29b38] text-left space-y-1.5 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 text-[#58180D] font-dnd-title font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#b45309]" />
            ¡Has sido convocado a la mesa de juego!
          </div>
          <p className="text-xs text-[#242528]/90 font-dnd-body leading-relaxed">
            El Dungeon Master te ha autorizado el acceso a <strong className="text-[#58180D] font-dnd-title">Segadores de Orcos</strong>. Continúa con tu cuenta de Google autorizada para acceder a tu hoja de personaje y a las crónicas.
          </p>
        </div>
      )}

      {/* Alerta de error si viene en URL o en cliente */}
      {(errorParam || clientError) && (
        <div className="p-3.5 rounded-sm bg-[#fbeeed] border border-[#7a2021] text-[#58180D] text-xs text-left flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#7a2021] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-dnd-title font-bold block uppercase tracking-wider text-[11px]">
              Fallo de Autenticación
            </span>
            <p className="text-xs font-dnd-body">
              {clientError || (errorParam === 'no_email'
                ? 'La cuenta de Google no proporcionó un correo electrónico válido.'
                : errorParam === 'auth_exchange_failed'
                ? 'No se pudo intercambiar el código de autorización con Supabase.'
                : errorParam === 'unauthorized'
                ? 'El correo autenticado no figura en la lista de acceso de la mesa.'
                : `Error del proveedor: ${errorParam}`)}
            </p>
          </div>
        </div>
      )}

      {/* Botón de Google OAuth Estilo Sello */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-3 px-5 py-3.5 rounded-sm bg-[#58180D] hover:bg-[#7a2021] text-[#fdf6ea] border-2 border-[#c29b38] font-dnd-title uppercase tracking-wider font-bold transition disabled:opacity-50 disabled:cursor-not-allowed text-xs shadow-md"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#fdf6ea] border-t-transparent rounded-full animate-spin" />
              Invocando portal...
            </span>
          ) : (
            <>
              {/* Icono oficial Google SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continuar con Google
            </>
          )}
        </button>

        {/* Separador y Acceso Rápido Local (Exclusivo para entorno de desarrollo local) */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#d4c2a5]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#fdf6ea] px-2 text-[#58544d] font-dnd-title">o en desarrollo local</span>
              </div>
            </div>

            <div className="p-4 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] text-left space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#58180D] font-dnd-title font-bold text-xs uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-[#b45309]" />
                  Acceso Rápido en Local
                </div>
                <DndBadge variant="parchment" size="sm">
                  Sin Google OAuth
                </DndBadge>
              </div>
              <p className="text-[11px] text-[#58544d] font-dnd-body leading-relaxed">
                Para probar en tu máquina local sin necesidad de configurar credenciales en Supabase / Google Cloud:
              </p>

              <div className="space-y-1.5 pt-1">
                <a
                  href={`/api/auth/dev-login?role=dm&next=${encodeURIComponent(sanitizeNextPath(nextParam))}`}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-sm bg-[#58180D] hover:bg-[#7a2021] border border-[#7a2021] text-[#fdf6ea] text-xs font-dnd-title font-bold uppercase tracking-wider transition shadow-xs"
                >
                  👑 Entrar como Dungeon Master (William)
                </a>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <a
                    href={`/api/auth/dev-login?role=honiel&next=${encodeURIComponent(sanitizeNextPath(nextParam))}`}
                    className="flex items-center justify-center gap-1 p-2 rounded-sm bg-[#fdf6ea] hover:bg-[#f4ebe1] border border-[#d4c2a5] text-[#242528] text-[11px] font-dnd-body transition font-semibold"
                  >
                    🧙 Honiel (Jugador)
                  </a>
                  <a
                    href={`/api/auth/dev-login?role=eru&next=${encodeURIComponent(sanitizeNextPath(nextParam))}`}
                    className="flex items-center justify-center gap-1 p-2 rounded-sm bg-[#fdf6ea] hover:bg-[#f4ebe1] border border-[#d4c2a5] text-[#242528] text-[11px] font-dnd-body transition font-semibold"
                  >
                    ⚔️ Eru (Jugador)
                  </a>
                  <a
                    href={`/api/auth/dev-login?role=alizar&next=${encodeURIComponent(sanitizeNextPath(nextParam))}`}
                    className="flex items-center justify-center gap-1 p-2 rounded-sm bg-[#fdf6ea] hover:bg-[#f4ebe1] border border-[#d4c2a5] text-[#242528] text-[11px] font-dnd-body transition font-semibold"
                  >
                    🛠️ Alizar (Jugador)
                  </a>
                  <a
                    href={`/api/auth/dev-login?role=solaria&next=${encodeURIComponent(sanitizeNextPath(nextParam))}`}
                    className="flex items-center justify-center gap-1 p-2 rounded-sm bg-[#fdf6ea] hover:bg-[#f4ebe1] border border-[#d4c2a5] text-[#242528] text-[11px] font-dnd-body transition font-semibold"
                  >
                    🌿 Solaria (Jugadora)
                  </a>
                </div>
              </div>
            </div>
          </>
        )}

        <p className="text-[11px] text-[#8a7f72] font-dnd-body leading-relaxed pt-1">
          El acceso con Google en producción está restringido a jugadores registrados en la lista blanca de la campaña.
        </p>
      </div>

      <div className="pt-4 border-t border-[#d4c2a5]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#58544d] hover:text-[#58180D] font-dnd-title uppercase tracking-wider transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a la página principal
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex items-center justify-center">
        <Suspense fallback={<div className="text-slate-400 text-xs">Cargando santuario...</div>}>
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
