import { Sparkles, ScrollText, Swords, Shield, Dices } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroActionButtons } from '@/components/landing/hero-action-buttons';
import { TaperedRule, DndBadge } from '@segadores/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-16">
        {/* Hero Section */}
        <section className="pt-10 sm:pt-16 pb-8 text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2">
            <DndBadge variant="parchment" size="sm" icon={<Sparkles className="w-3.5 h-3.5 text-dnd-gold" />}>
              Consola de Combate Táctico y Lore en Tiempo Real
            </DndBadge>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-wide text-dnd-ink font-dnd-title uppercase leading-tight drop-shadow-sm">
              Más allá de las llamas de{' '}
              <span className="text-dnd-gold">
                Phandalin
              </span>
            </h1>
            <TaperedRule variant="gold" />
          </div>

          <p className="text-base sm:text-lg text-dnd-ink-muted font-dnd-body leading-relaxed">
            Portal interactivo para los aventureros de <strong className="text-dnd-crimson font-dnd-title">Segadores de Orcos</strong>. Hojas de personaje reactivas, consola de combate, evaluador de estados (condiciones y heridas d20), ranuras de conjuro y compendio de reglas D&D 5.5e.
          </p>

          {/* Action Buttons */}
          <HeroActionButtons />
        </section>

        {/* Feature Pillars en Estilo Manual de Campaña */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-3 shadow-md hover:border-dnd-gold transition">
            <div className="w-10 h-10 rounded-sm bg-dnd-crimson border border-dnd-crimson-hover flex items-center justify-center text-dnd-gold shadow-xs">
              <Swords className="w-5 h-5 text-dnd-gold" />
            </div>
            <h2 className="text-base font-bold text-dnd-crimson font-dnd-title uppercase tracking-wider">
              Consola de Combate Táctico
            </h2>
            <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
              Economía de acciones (acción, adicional, reacción), concentración y filtros dinámicos según tu estado actual (derribado, silenciado, apresado o malherido).
            </p>
          </div>

          <div className="p-6 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-3 shadow-md hover:border-dnd-gold transition">
            <div className="w-10 h-10 rounded-sm bg-dnd-crimson border border-dnd-crimson-hover flex items-center justify-center text-dnd-gold shadow-xs">
              <ScrollText className="w-5 h-5 text-dnd-gold" />
            </div>
            <h2 className="text-base font-bold text-dnd-crimson font-dnd-title uppercase tracking-wider">
              Compendio y Reglas de Mesa
            </h2>
            <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
              Integración de las Tablas A y B de Heridas en combate (d20), cálculo automático de multiclase al 50% por alcance en PX y sincronización de objetos con sintonización.
            </p>
          </div>

          <div className="p-6 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-3 shadow-md hover:border-dnd-gold transition">
            <div className="w-10 h-10 rounded-sm bg-dnd-crimson border border-dnd-crimson-hover flex items-center justify-center text-dnd-gold shadow-xs">
              <Sparkles className="w-5 h-5 text-dnd-gold" />
            </div>
            <h2 className="text-base font-bold text-dnd-crimson font-dnd-title uppercase tracking-wider">
              Sincronización en Vivo
            </h2>
            <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
              Sincronización en tiempo real vía Supabase Realtime entre el DM y los jugadores: puntos de golpe, dados de golpe gastados, efectos activos y el baúl de la compañía.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
