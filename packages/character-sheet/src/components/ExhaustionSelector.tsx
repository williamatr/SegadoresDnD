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
    <div className="p-4 rounded-2xl bg-dnd-card border border-dnd-border space-y-3 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className={`w-4 h-4 ${currentLevel > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
          <h4 className="font-fantasy font-semibold text-xs text-slate-200 uppercase tracking-wider">
            Agotamiento (D&D 5.5e)
          </h4>
        </div>
        {currentLevel > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 font-bold text-[11px] font-mono">
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
              className={`py-1.5 rounded-lg text-xs font-mono font-bold transition flex flex-col items-center justify-center border ${
                isSelected
                  ? lvl === 6
                    ? 'bg-red-950 border-red-500 text-red-200 ring-2 ring-red-500'
                    : isDanger
                    ? 'bg-amber-950 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                    : 'bg-dnd-surface border-dnd-gold text-dnd-gold ring-1 ring-dnd-gold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span>{lvl === 6 ? '💀' : lvl}</span>
            </button>
          );
        })}
      </div>

      {/* Desglose de Penalizaciones 5.5e */}
      {currentLevel > 0 ? (
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-900/40 space-y-1 text-xs">
          <div className="flex items-center justify-between text-amber-300 font-medium">
            <span>Penalizador a tiradas d20 y CD de conjuros:</span>
            <span className="font-mono font-bold text-red-400">-{d20Penalty}</span>
          </div>
          <div className="flex items-center justify-between text-amber-300 font-medium">
            <span>Reducción de velocidad:</span>
            <span className="font-mono font-bold text-red-400">-{speedPenalty} pies</span>
          </div>
          {currentLevel === 6 && (
            <p className="text-[11px] text-red-400 font-bold text-center pt-1 border-t border-red-900/60">
              💀 Nivel 6: Muerte inmediata por agotamiento físico absoluto.
            </p>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-slate-500">
          Sin penalizadores de fatiga activos.
        </p>
      )}
    </div>
  );
}
