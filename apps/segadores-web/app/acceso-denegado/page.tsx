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
        <div className="w-full max-w-xl p-6 sm:p-10 rounded-2xl bg-dnd-card border border-red-900/60 shadow-2xl shadow-red-950/40 text-center space-y-6">
          {/* Emblema de Bloqueo Arcano */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/50 text-red-300 text-xs font-mono">
              <Lock className="w-3.5 h-3.5" />
              ERROR 403 &bull; CÍRCULO DE EXCLUSIÓN
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-100 font-fantasy">
              Acceso Denegado
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Las puertas del campamento de <strong className="text-slate-200">Segadores de Orcos</strong> están cerradas.
              La cuenta con la que has iniciado sesión no se encuentra en la lista blanca de aventureros autorizados ni en el censo de la mesa.
            </p>
          </div>

          {/* Caja explicativa de Lore / DM */}
          <div className="p-4 rounded-xl bg-dnd-surface border border-dnd-border text-left text-xs text-slate-300 space-y-2">
            <span className="font-semibold text-dnd-gold block">
              ¿Perteneces a esta campaña?
            </span>
            <p className="text-slate-400 leading-relaxed">
              Si formas parte de la mesa de juego, solicita al <strong className="text-slate-200">Dungeon Master</strong> que registre tu correo en la tabla de jugadores autorizados o en la lista de acceso de la campaña.
            </p>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <form action="/auth/signout" method="POST" className="w-full sm:w-auto">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-950/80 border border-red-700/60 text-red-200 font-semibold hover:bg-red-900 transition shadow-md shadow-red-950/40 text-xs"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </form>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-dnd-surface border border-dnd-border text-slate-300 font-semibold hover:text-slate-100 hover:border-slate-600 transition text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Inicio
            </Link>

            <Link
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-dnd-surface border border-dnd-border text-dnd-gold font-semibold hover:brightness-110 transition text-xs"
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
