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
    <div className={`p-4 rounded-sm bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] dnd-notched space-y-2.5 shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${isOverLimit ? 'text-[#58180D] animate-bounce' : 'text-[#c29b38]'}`} />
          <h4 className="font-dnd-title font-bold text-xs text-[#58180D] uppercase tracking-wider">
            Sintonización Mágica (Attunement)
          </h4>
        </div>
        <span
          className={`font-dnd-title text-xs font-bold px-2 py-0.5 rounded-sm border ${
            isOverLimit
              ? 'bg-[#58180D] border-[#7a2021] text-[#fdf6ea]'
              : isAtLimit
              ? 'bg-[#fef9c3] border-[#ca8a04] text-[#854d0e]'
              : 'bg-[#ede2cb] border-[#d4c2a5] text-[#58180D]'
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
                    ? 'bg-[#58180D] border-[#7a2021] shadow-sm'
                    : 'bg-[#c29b38] border-[#854d0e] shadow-sm'
                  : 'bg-[#ede2cb] border-[#d4c2a5]'
              }`}
            />
          );
        })}
      </div>

      {isOverLimit ? (
        <div className="p-2 rounded-sm bg-[#58180D] border border-[#7a2021] text-[11px] text-[#fdf6ea] flex items-center gap-2 font-dnd-title font-bold">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#e5b960]" />
          <span>
            ¡Límite excedido! Solo puedes mantener sintonizados {maxSlots} objetos simultáneamente.
          </span>
        </div>
      ) : (
        <p className="text-[11px] text-[#58544d] font-dnd-body leading-tight">
          Sintonizarse requiere 1 descanso corto. Los objetos que requieren sintonización pero no están activos funcionan como equipo mundano.
        </p>
      )}
    </div>
  );
}
