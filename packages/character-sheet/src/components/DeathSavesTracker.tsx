import React, { useState } from 'react';
import { Skull, CheckCircle2, RotateCcw, Dices, Sparkles } from 'lucide-react';
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
  const [showPhysicalEntry, setShowPhysicalEntry] = useState(false);
  const [selectedPhysicalD20, setSelectedPhysicalD20] = useState<number | null>(null);
  const [lastRollMessage, setLastRollMessage] = useState<string | null>(null);

  const applyRollResult = (val: number, isPhysical: boolean) => {
    if (readOnly) return;
    if (val === 1) {
      onUpdateDeathSaves?.({
        ...deathSaves,
        failures: Math.min(3, failures + 2)
      });
      setLastRollMessage(`d20: ${val} (💀 Pifia: +2 fallos)${isPhysical ? ' · Mesa' : ' · Digital'}`);
    } else if (val >= 2 && val <= 9) {
      onUpdateDeathSaves?.({
        ...deathSaves,
        failures: Math.min(3, failures + 1)
      });
      setLastRollMessage(`d20: ${val} (❌ Fallo: +1 fallo)${isPhysical ? ' · Mesa' : ' · Digital'}`);
    } else if (val >= 10 && val <= 19) {
      onUpdateDeathSaves?.({
        ...deathSaves,
        successes: Math.min(3, successes + 1)
      });
      setLastRollMessage(`d20: ${val} (✅ Éxito: +1 éxito)${isPhysical ? ' · Mesa' : ' · Digital'}`);
    } else if (val === 20) {
      onUpdateDeathSaves?.({
        ...deathSaves,
        successes: 3
      });
      setLastRollMessage(`d20: 20 (✨ ¡Crítico! Estabilizado)${isPhysical ? ' · Mesa' : ' · Digital'}`);
    }
  };

  const handleRollDigital = () => {
    const val = Math.floor(Math.random() * 20) + 1;
    applyRollResult(val, false);
  };

  const handleApplyPhysical = (val: number) => {
    setSelectedPhysicalD20(val);
    applyRollResult(val, true);
    setShowPhysicalEntry(false);
  };

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
    setLastRollMessage(null);
    setSelectedPhysicalD20(null);
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

      {/* Selector de Dados (Digital o Tirado en Mesa Físico) */}
      {!readOnly && !isDead && !isStabilized && (
        <div className="space-y-2 pt-1 border-t border-dnd-border/50">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleRollDigital}
              className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
              title="Tirar 1d20 digital"
            >
              <Dices className="w-3 h-3 text-dnd-gold" />
              <span>Tirar Digital</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPhysicalEntry(!showPhysicalEntry)}
              className={`py-1 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition ${
                showPhysicalEntry
                  ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500'
                  : 'bg-amber-950/30 hover:bg-amber-950/60 border-amber-800/40 text-amber-300'
              }`}
              title="Registrar tirada física en mesa"
            >
              <span>🎲 Tiré en Mesa</span>
            </button>
          </div>

          {/* Botonera de 1 al 20 para el d20 físico tirado en la mesa */}
          {showPhysicalEntry && (
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-amber-600/60 space-y-1.5 animate-in fade-in">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide block">
                Selecciona tu d20 físico de la mesa:
              </span>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleApplyPhysical(num)}
                    className={`py-1 rounded text-xs font-mono font-bold transition ${
                      num === 20
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                        : num === 1
                          ? 'bg-red-700 text-white hover:bg-red-600'
                          : num >= 10
                            ? 'bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900'
                            : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-amber-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {lastRollMessage && (
            <div className="text-[10px] font-mono text-center text-slate-300 bg-slate-900/60 py-1 px-2 rounded-lg border border-slate-800">
              {lastRollMessage}
            </div>
          )}
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
