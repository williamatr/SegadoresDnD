import React from 'react';
import { Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AttunementTrackerProps {
  attunedCount: number;
  maxSlots: number;
  className?: string;
}

export function AttunementTracker({
  attunedCount,
  maxSlots = 3,
  className = ''
}: AttunementTrackerProps) {
  const isOverLimit = attunedCount > maxSlots;
  const isAtLimit = attunedCount === maxSlots;

  return (
    <div className={`p-4 rounded-2xl bg-dnd-card border border-dnd-border space-y-2.5 shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${isOverLimit ? 'text-red-400 animate-bounce' : 'text-purple-400'}`} />
          <h4 className="font-fantasy font-semibold text-xs text-slate-200 uppercase tracking-wider">
            Sintonización Mágica (Attunement)
          </h4>
        </div>
        <span
          className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full border ${
            isOverLimit
              ? 'bg-red-950 border-red-700 text-red-300'
              : isAtLimit
              ? 'bg-amber-950 border-amber-700 text-amber-300'
              : 'bg-purple-950 border-purple-700 text-purple-300'
          }`}
        >
          {attunedCount} / {maxSlots} Ranuras
        </span>
      </div>

      {/* Indicadores visuales de ranuras */}
      <div className="flex items-center gap-2">
        {Array.from({ length: maxSlots }).map((_, idx) => {
          const isSlotFilled = idx < attunedCount;
          return (
            <div
              key={idx}
              className={`flex-1 h-2 rounded-full border transition-all ${
                isSlotFilled
                  ? isOverLimit
                    ? 'bg-red-500 border-red-400 shadow-sm shadow-red-900'
                    : 'bg-purple-500 border-purple-400 shadow-sm shadow-purple-900'
                  : 'bg-slate-900 border-slate-700'
              }`}
            />
          );
        })}
      </div>

      {isOverLimit ? (
        <div className="p-2 rounded-xl bg-red-950/60 border border-red-800/60 text-[11px] text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
          <span>
            ¡Límite excedido! Solo puedes mantener sintonizados {maxSlots} objetos simultáneamente.
          </span>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 leading-tight">
          Sintonizarse requiere 1 descanso corto. Los objetos que requieren sintonización pero no están activos funcionan como equipo mundano.
        </p>
      )}
    </div>
  );
}
