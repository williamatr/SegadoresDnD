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
    <div className={`p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2.5 shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${isOverLimit ? 'text-dnd-crimson animate-bounce' : 'text-dnd-gold'}`} />
          <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
            Sintonización Mágica (Attunement)
          </h4>
        </div>
        <span
          className={`font-dnd-title text-xs font-bold px-2 py-0.5 rounded-sm border ${
            isOverLimit
              ? 'bg-dnd-crimson border-dnd-crimson-hover text-white'
              : isAtLimit
              ? 'bg-dnd-gold-surface border-dnd-gold text-dnd-gold'
              : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-crimson'
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
                    ? 'bg-dnd-crimson border-dnd-crimson-hover shadow-sm'
                    : 'bg-dnd-gold border-dnd-gold-light shadow-sm'
                  : 'bg-dnd-parchment-contrast border-dnd-border-antique'
              }`}
            />
          );
        })}
      </div>

      {isOverLimit ? (
        <div className="p-2 rounded-md bg-dnd-crimson border border-dnd-crimson-hover text-xs text-white flex items-center gap-2 font-dnd-title font-bold">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-dnd-gold-light" />
          <span>
            ¡Límite excedido! Solo puedes mantener sintonizados {maxSlots} objetos simultáneamente.
          </span>
        </div>
      ) : (
        <p className="text-[11px] text-dnd-ink-muted font-dnd-body leading-tight">
          Sintonizarse requiere 1 descanso corto. Los objetos que requieren sintonización pero no están activos funcionan como equipo mundano.
        </p>
      )}
    </div>
  );
}
