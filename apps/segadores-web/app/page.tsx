import { Sparkles, ScrollText, Swords } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroActionButtons } from '@/components/landing/hero-action-buttons';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-16">
        {/* Hero Section */}
        <section className="pt-10 sm:pt-16 pb-8 text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dnd-gold/10 border border-dnd-gold/30 text-dnd-gold-light text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Consola de Combate Táctico y Lore en Tiempo Real
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 font-fantasy leading-tight">
            Más allá de las llamas de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-dnd-gold to-amber-400">
              Phandalin
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Portal interactivo para los aventureros de <strong className="text-slate-100">Segadores de Orcos</strong>. Hojas de personaje reactivas, consola de combate, evaluador de estados (condiciones y heridas d20), ranuras de conjuro y compendio de reglas D&D 5.5e.
          </p>

          {/* Action Buttons con Modal Acerca de */}
          <HeroActionButtons />
        </section>

        {/* Feature Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-dnd-card border border-dnd-border/80 space-y-3 hover:border-amber-700/40 transition">
            <div className="w-10 h-10 rounded-lg bg-red-950/50 border border-red-800/40 flex items-center justify-center text-red-400">
              <Swords className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Consola de Combate Táctico</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Economía de acciones (acción, adicional, reacción), concentración y filtros dinámicos según tu estado actual (derribado, silenciado, apresado o malherido).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dnd-card border border-dnd-border/80 space-y-3 hover:border-amber-700/40 transition">
            <div className="w-10 h-10 rounded-lg bg-amber-950/50 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <ScrollText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Compendio y Reglas de Mesa</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Integración de las Tablas A y B de Heridas en combate (d20), cálculo automático de multiclase al 50% por alcance en PX y sincronización de objetos con sintonización.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dnd-card border border-dnd-border/80 space-y-3 hover:border-amber-700/40 transition">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/50 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Sincronización en Vivo</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sincronización en tiempo real vía Supabase Realtime entre el DM y los jugadores: puntos de golpe, dados de golpe gastados, efectos activos y el baúl de la compañía.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
