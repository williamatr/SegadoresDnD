import React from 'react';
import { Skull, CheckCircle2, RotateCcw } from 'lucide-react';
import type { DeathSaves } from '@segadores/dnd-core';

interface DeathSavesTrackerProps {
  deathSaves: DeathSaves;
  onUpdateDeathSaves?: (deathSaves: DeathSaves) => void;
  readOnly?: boolean;
}

export function DeathSavesTracker({
  deathSaves,
  onUpdateDeathSaves,
  readOnly = false
}: DeathSavesTrackerProps) {
  const successes = Math.min(3, Math.max(0, deathSaves.successes || 0));
  const failures = Math.min(3, Math.max(0, deathSaves.failures || 0));

  const handleToggleSuccess = (index: number) => {
    if (readOnly) return;
    const newSuccesses = index + 1 === successes ? index : index + 1;
    onUpdateDeathSaves?.({
      ...deathSaves,
      successes: newSuccesses
    });
  };

  const handleToggleFailure = (index: number) => {
    if (readOnly) return;
    const newFailures = index + 1 === failures ? index : index + 1;
    onUpdateDeathSaves?.({
      ...deathSaves,
      failures: newFailures
    });
  };

  const handleReset = () => {
    if (readOnly) return;
    onUpdateDeathSaves?.({
      successes: 0,
      failures: 0
    });
  };

  const isDead = failures >= 3;
  const isStabilized = successes >= 3;

  return (
    <div className="p-4 rounded-2xl bg-dnd-card border border-dnd-border space-y-3 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skull className={`w-4 h-4 ${isDead ? 'text-red-500 animate-bounce' : 'text-slate-400'}`} />
          <h4 className="font-fantasy font-semibold text-xs text-slate-200 uppercase tracking-wider">
            Salvaciones contra la Muerte
          </h4>
        </div>
        {!readOnly && (successes > 0 || failures > 0) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition"
            title="Reiniciar salvaciones"
          >
            <RotateCcw className="w-3 h-3" /> Reiniciar
          </button>
        )}
      </div>

      {/* Estados extremos */}
      {isDead && (
        <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs font-bold text-center animate-pulse">
          💀 ¡3 Fallos! El personaje ha sucumbido a la muerte.
        </div>
      )}
      {isStabilized && !isDead && (
        <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs font-bold text-center">
          ✨ ¡3 Éxitos! El personaje está estabilizado (0 PG inconsciente).
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 pt-1">
        {/* Éxitos */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Éxitos
          </span>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map(idx => (
              <button
                key={idx}
                type="button"
                disabled={readOnly}
                onClick={() => handleToggleSuccess(idx)}
                className={`w-6 h-6 rounded-full border transition flex items-center justify-center ${
                  idx < successes
                    ? 'bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-900/50'
                    : 'bg-slate-900 border-slate-700 hover:border-emerald-600'
                }`}
              >
                {idx < successes && <span className="w-2 h-2 rounded-full bg-slate-950" />}
              </button>
            ))}
          </div>
        </div>

        {/* Fallos */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-red-400 flex items-center gap-1">
            <Skull className="w-3.5 h-3.5" /> Fallos
          </span>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map(idx => (
              <button
                key={idx}
                type="button"
                disabled={readOnly}
                onClick={() => handleToggleFailure(idx)}
                className={`w-6 h-6 rounded-full border transition flex items-center justify-center ${
                  idx < failures
                    ? 'bg-red-600 border-red-500 shadow-md shadow-red-950'
                    : 'bg-slate-900 border-slate-700 hover:border-red-600'
                }`}
              >
                {idx < failures && <span className="w-2 h-2 rounded-full bg-slate-950" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
