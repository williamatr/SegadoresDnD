import React, { useState } from 'react';
import { Dices, Sun, Moon, Heart, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface HitDiceTrackerProps {
  hitDiceTotal: string;
  hitDiceCurrent: number;
  totalLevel: number;
  conModifier?: number;
  currentHp?: number;
  maxHp?: number;
  tempHp?: number;
  onUpdateHp?: (currentHp: number, tempHp: number) => void;
  onUpdateHitDice?: (current: number) => void;
  onShortRest?: () => void;
  onLongRest?: () => void;
  readOnly?: boolean;
}

interface LastRoll {
  roll: number;
  conMod: number;
  healing: number;
  dieSides: number;
  timestamp: number;
}

export function HitDiceTracker({
  hitDiceTotal,
  hitDiceCurrent,
  totalLevel,
  conModifier = 0,
  currentHp = 10,
  maxHp = 10,
  tempHp = 0,
  onUpdateHp,
  onUpdateHitDice,
  onShortRest,
  onLongRest,
  readOnly = false
}: HitDiceTrackerProps) {
  const current = Math.max(0, Math.min(totalLevel, hitDiceCurrent));
  const [lastRoll, setLastRoll] = useState<LastRoll | null>(null);
  const [restModal, setRestModal] = useState<'short' | 'long' | null>(null);

  // Extraer el tipo de dado (d6, d8, d10, d12) de la cadena hitDiceTotal
  const match = hitDiceTotal.match(/d(\d+)/i);
  const dieSides = match ? parseInt(match[1], 10) : 8;

  // Acción: Lanzar Dado de Golpe para curarse en descanso corto
  const handleRollHitDie = () => {
    if (readOnly || current <= 0) return;

    // Tirada aleatoria del dado de golpe (1 a dieSides)
    const roll = Math.floor(Math.random() * dieSides) + 1;
    // En D&D 5e / 5.5e: Curación = Tirada + Modificador de CON (mínimo 1)
    const healing = Math.max(1, roll + conModifier);
    const newHp = Math.min(maxHp, currentHp + healing);

    // Actualizar estado en la ficha
    onUpdateHitDice?.(current - 1);
    onUpdateHp?.(newHp, tempHp);

    setLastRoll({
      roll,
      conMod: conModifier,
      healing,
      dieSides,
      timestamp: Date.now()
    });
  };

  const triggerShortRest = () => {
    onShortRest?.();
    setRestModal('short');
  };

  const triggerLongRest = () => {
    onLongRest?.();
    setRestModal('long');
    setLastRoll(null);
  };

  return (
    <div className="p-4 rounded-2xl bg-dnd-card border border-dnd-border space-y-3 shadow-md relative">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dices className="w-4 h-4 text-dnd-gold" />
          <h4 className="font-fantasy font-semibold text-xs text-slate-200 uppercase tracking-wider">
            Dados de Golpe y Descansos
          </h4>
        </div>
        <span className="font-mono text-xs font-bold text-slate-300">
          <span className="text-dnd-gold font-bold">{current}</span> / {totalLevel} <span className="text-[11px] text-slate-400 font-normal">({hitDiceTotal})</span>
        </span>
      </div>

      {/* Botón de Tirar Dado de Golpe con curación en vivo */}
      {!readOnly && (
        <div className="space-y-2">
          <button
            type="button"
            disabled={current <= 0 || currentHp >= maxHp}
            onClick={handleRollHitDie}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 hover:from-amber-900 hover:to-amber-900 border border-amber-600/60 text-xs font-fantasy font-bold text-amber-200 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm flex items-center justify-center gap-2 group"
            title={
              current <= 0
                ? 'No te quedan dados de golpe (recuperarás la mitad tras un descanso largo)'
                : currentHp >= maxHp
                ? 'Tus puntos de golpe ya están al máximo'
                : `Gasta 1 dado de golpe: Tira 1d${dieSides} + ${conModifier} (CON) y cura tus PG en vivo`
            }
          >
            <Dices className="w-4 h-4 text-dnd-gold group-hover:rotate-180 transition-transform duration-300" />
            <span>Tirar Dado de Golpe (1d{dieSides}{conModifier >= 0 ? `+${conModifier}` : conModifier} CON)</span>
          </button>

          {/* Notificación de Última Tirada de Curación */}
          {lastRoll && (
            <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-600/50 text-[11px] text-emerald-200 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>
                  ¡Tiraste <strong>1d{lastRoll.dieSides} ({lastRoll.roll})</strong> {lastRoll.conMod >= 0 ? `+${lastRoll.conMod}` : lastRoll.conMod} CON = <strong className="text-emerald-300 font-bold">+{lastRoll.healing} PG</strong>!
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">
                Vida: {currentHp}/{maxHp}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Botones de Descanso */}
      {!readOnly && (
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dnd-border/60">
          <button
            type="button"
            onClick={triggerShortRest}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-700/60 text-amber-200 text-xs font-semibold transition shadow-sm"
            title="Descanso Corto (1 hora): Restaura poderes de descanso corto (Acción Súbita, Nuevas Energías, Forma Salvaje) y permite curarse tirando dados de golpe"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            Descanso Corto (1 h)
          </button>
          <button
            type="button"
            onClick={triggerLongRest}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/60 text-indigo-200 text-xs font-semibold transition shadow-sm"
            title="Descanso Largo (8 h): Restaura el 100% de PG, recupera la mitad de dados de golpe, ranuras de magia y reduce 1 nivel de agotamiento"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            Descanso Largo (8 h)
          </button>
        </div>
      )}

      {/* MODAL / BANNER DE DESCANSO CORTO */}
      {restModal === 'short' && (
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-amber-950/90 border border-amber-500/70 text-left space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-amber-800/40 pb-2">
            <div className="flex items-center gap-2 text-amber-300 font-fantasy font-bold text-xs uppercase">
              <Sun className="w-4 h-4 text-amber-400" />
              ¡Descanso Corto Completado! (1 Hora)
            </div>
            <button
              onClick={() => setRestModal(null)}
              className="p-1 rounded-lg hover:bg-amber-900/50 text-slate-400 hover:text-slate-100 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Recursos de descanso corto recargados al 100%
            </div>
            <p className="text-[11px] text-slate-400">
              Tus habilidades de recuperación por hora (como <em>Acción Súbita</em>, <em>Nuevas Energías</em>, <em>Forma Salvaje / Esporas</em> o <em>Recuperación Arcana</em>) ya están listas para volver a usarse.
            </p>
          </div>

          {currentHp < maxHp && current > 0 && (
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-200 space-y-1.5">
              <span className="block font-semibold">¿Necesitas recuperar vida?</span>
              <p className="text-slate-400 text-[10px]">
                En D&D, durante un descanso corto no te curas automáticamente; debes vendarte tirando dados de golpe:
              </p>
              <button
                type="button"
                onClick={handleRollHitDie}
                className="w-full py-1.5 px-2 rounded-lg bg-amber-900/80 hover:bg-amber-800 text-amber-100 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Dices className="w-3.5 h-3.5 text-amber-300" />
                Tirar 1d{dieSides}{conModifier >= 0 ? `+${conModifier}` : conModifier} ({current} dados disponibles)
              </button>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setRestModal(null)}
              className="px-3 py-1 rounded-lg bg-dnd-surface border border-dnd-border hover:border-slate-500 text-xs font-medium text-slate-300 hover:text-slate-100 transition"
            >
              Reanudar Aventura
            </button>
          </div>
        </div>
      )}

      {/* MODAL / BANNER DE DESCANSO LARGO */}
      {restModal === 'long' && (
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-950/90 border border-indigo-500/70 text-left space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-indigo-800/40 pb-2">
            <div className="flex items-center gap-2 text-indigo-300 font-fantasy font-bold text-xs uppercase">
              <Moon className="w-4 h-4 text-indigo-400" />
              ¡Descanso Largo Completado! (8 Horas)
            </div>
            <button
              onClick={() => setRestModal(null)}
              className="p-1 rounded-lg hover:bg-indigo-900/50 text-slate-400 hover:text-slate-100 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Puntos de Golpe restaurados al 100% ({maxHp} PG)
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Ranuras de conjuro y poderes diarios restablecidos
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Dados de Golpe recuperados (+{Math.max(1, Math.floor(totalLevel / 2))} dados)
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Fatiga / Agotamiento reducido en 1 nivel
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setRestModal(null)}
              className="px-3 py-1 rounded-lg bg-dnd-surface border border-dnd-border hover:border-slate-500 text-xs font-medium text-slate-300 hover:text-slate-100 transition"
            >
              Nuevo Día de Campaña
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
