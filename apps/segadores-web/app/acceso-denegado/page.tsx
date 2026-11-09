import React from 'react';
import Link from 'next/link';
import { ShieldAlert, LogOut, ArrowLeft, Dices, Lock } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata = {
  title: 'Acceso Denegado (403) | Segadores de Orcos',
  description: 'Tu cuenta no figura en la lista blanca de la campaña.',
};

export default function AccesoDenegadoPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-xl p-6 sm:p-10 rounded-sm bg-dnd-parchment border-2 border-dnd-crimson dnd-notched shadow-2xl text-center space-y-6 text-dnd-ink">
          {/* Emblema de Bloqueo Arcano */}
          <div className="mx-auto w-16 h-16 rounded-sm bg-dnd-crimson border-2 border-dnd-gold flex items-center justify-center text-dnd-gold shadow-md">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-dnd-crimson-surface border border-dnd-crimson text-dnd-crimson text-xs font-dnd-title font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              ERROR 403 &bull; CÍRCULO DE EXCLUSIÓN
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-dnd-crimson font-dnd-title uppercase">
              Acceso Denegado
            </h1>
            <p className="text-sm text-dnd-ink-muted max-w-md mx-auto leading-relaxed font-dnd-body">
              Las puertas del campamento de <strong className="text-dnd-crimson font-dnd-title font-bold">Segadores de Orcos</strong> están cerradas.
              La cuenta con la que has iniciado sesión no se encuentra en la lista blanca de aventureros autorizados ni en el censo de la mesa.
            </p>
          </div>

          {/* Caja explicativa de Lore / DM */}
          <div className="p-4 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-left text-xs text-dnd-ink space-y-2 font-dnd-body">
            <span className="font-bold text-dnd-crimson font-dnd-title block uppercase tracking-wide">
              ¿Perteneces a esta campaña?
            </span>
            <p className="text-dnd-ink-muted leading-relaxed">
              Si formas parte de la mesa de juego, solicita al <strong className="text-dnd-crimson font-dnd-title font-bold">Dungeon Master</strong> que registre tu correo en la tabla de jugadores autorizados o en la lista de acceso de la campaña.
            </p>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <form action="/auth/signout" method="POST" className="w-full sm:w-auto">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-dnd-crimson border border-dnd-gold text-white font-dnd-title font-bold hover:bg-dnd-crimson-hover transition shadow-md text-xs uppercase tracking-wider"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </form>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted font-dnd-title font-semibold hover:text-dnd-ink hover:border-dnd-gold transition text-xs uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Inicio
            </Link>

            <Link
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-gold text-dnd-gold font-dnd-title font-bold hover:bg-dnd-parchment transition text-xs uppercase tracking-wider"
            >
              <Dices className="w-4 h-4" />
              Explorar Demo
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
