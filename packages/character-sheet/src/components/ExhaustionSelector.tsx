import React from 'react';
import { Flame, AlertTriangle, Skull } from 'lucide-react';

interface ExhaustionSelectorProps {
  exhaustion: number;
  onUpdateExhaustion?: (exhaustion: number) => void;
  readOnly?: boolean;
}

export function ExhaustionSelector({
  exhaustion = 0,
  onUpdateExhaustion,
  readOnly = false
}: ExhaustionSelectorProps) {
  const currentLevel = Math.max(0, Math.min(6, exhaustion));
  const d20Penalty = currentLevel * 2;
  const speedPenalty = currentLevel * 5;

  return (
    <div className="p-4 rounded-lg bg-dnd-parchment text-dnd-ink border border-dnd-border-antique dnd-notched space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className={`w-4 h-4 ${currentLevel > 0 ? 'text-dnd-terracotta animate-pulse' : 'text-dnd-ink-subtle'}`} />
          <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
            Agotamiento (D&D 5.5e)
          </h4>
        </div>
        {currentLevel > 0 && (
          <span className="px-2 py-0.5 rounded-md bg-dnd-crimson border border-dnd-crimson-hover text-white font-bold text-xs font-dnd-title uppercase">
            Nivel {currentLevel}
          </span>
        )}
      </div>

      {/* Selector de Nivel 0 a 6 */}
      <div className="grid grid-cols-7 gap-1">
        {[0, 1, 2, 3, 4, 5, 6].map(lvl => {
          const isSelected = lvl === currentLevel;
          const isDanger = lvl >= 5;
          return (
            <button
              key={lvl}
              type="button"
              disabled={readOnly}
              onClick={() => onUpdateExhaustion?.(lvl)}
              className={`py-1.5 rounded-md text-xs font-dnd-title font-bold transition flex flex-col items-center justify-center border ${
                isSelected
                  ? lvl === 6
                    ? 'bg-dnd-crimson border-dnd-crimson-hover text-white ring-2 ring-dnd-crimson-hover shadow-sm'
                    : isDanger
                    ? 'bg-dnd-terracotta border-[#a34712] text-white ring-1 ring-[#a34712] shadow-sm'
                    : 'bg-dnd-parchment-contrast border-dnd-gold text-dnd-crimson ring-1 ring-dnd-gold shadow-xs'
                  : 'bg-dnd-parchment-dark border-dnd-border-antique text-dnd-ink-muted hover:border-dnd-gold hover:text-dnd-ink'
              }`}
            >
              <span>{lvl === 6 ? '💀' : lvl}</span>
            </button>
          );
        })}
      </div>

      {/* Desglose de Penalizaciones 5.5e */}
      {currentLevel > 0 ? (
        <div className="p-2.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique space-y-1 text-xs">
          <div className="flex items-center justify-between text-dnd-crimson font-dnd-body font-semibold">
            <span>Penalizador a tiradas d20 y CD de conjuros:</span>
            <span className="font-dnd-title font-bold text-dnd-crimson">-{d20Penalty}</span>
          </div>
          <div className="flex items-center justify-between text-dnd-crimson font-dnd-body font-semibold">
            <span>Reducción de velocidad:</span>
            <span className="font-dnd-title font-bold text-dnd-crimson">-{speedPenalty} pies</span>
          </div>
          {currentLevel === 6 && (
            <p className="text-[11px] text-dnd-crimson font-dnd-title font-bold text-center pt-1 border-t border-dnd-border-antique">
              💀 Nivel 6: Muerte inmediata por agotamiento físico absoluto.
            </p>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-dnd-ink-muted font-dnd-body">
          Sin penalizadores de fatiga activos.
        </p>
      )}
    </div>
  );
}
