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
    <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-3 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skull className={`w-4 h-4 ${isDead ? 'text-dnd-crimson animate-bounce' : 'text-dnd-ink-muted'}`} />
          <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
            Salvaciones contra la Muerte
          </h4>
        </div>
        {!readOnly && (successes > 0 || failures > 0) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] font-dnd-title text-dnd-ink-muted hover:text-dnd-crimson transition"
            title="Reiniciar salvaciones"
          >
            <RotateCcw className="w-3 h-3" /> Reiniciar
          </button>
        )}
      </div>

      {/* Estados extremos */}
      {isDead && (
        <div className="p-2.5 rounded-md bg-dnd-crimson border border-dnd-crimson-hover text-white text-xs font-dnd-title font-bold text-center animate-pulse shadow-md">
          💀 ¡3 Fallos! El personaje ha sucumbido a la muerte.
        </div>
      )}
      {isStabilized && !isDead && (
        <div className="p-2.5 rounded-sm bg-[#15803d] border border-[#166534] text-white text-xs font-dnd-title font-bold text-center shadow-md">
          ✨ ¡3 Éxitos! El personaje está estabilizado (0 PG inconsciente).
        </div>
      )}

      {/* Selector de Dados (Digital o Tirado en Mesa Físico) */}
      {!readOnly && !isDead && !isStabilized && (
        <div className="space-y-2 pt-1 border-t border-dnd-border-antique/80">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleRollDigital}
              className="py-1 px-2 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique text-dnd-crimson text-[11px] font-dnd-title font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
              title="Tirar 1d20 digital"
            >
              <Dices className="w-3 h-3 text-dnd-gold" />
              <span>Tirar Digital</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPhysicalEntry(!showPhysicalEntry)}
              className={`py-1 px-2 rounded-sm border text-[11px] font-dnd-title font-bold flex items-center justify-center gap-1.5 transition ${
                showPhysicalEntry
                  ? 'bg-dnd-gold/20 border-dnd-gold text-dnd-gold font-bold shadow-sm'
                  : 'bg-dnd-parchment-contrast hover:bg-dnd-parchment border-dnd-border-antique text-dnd-ink'
              }`}
              title="Registrar tirada física en mesa"
            >
              <span>🎲 Tiré en Mesa</span>
            </button>
          </div>

          {/* Botonera de 1 al 20 para el d20 físico tirado en la mesa */}
          {showPhysicalEntry && (
            <div className="p-2.5 rounded-sm bg-dnd-parchment-dark border-2 border-dnd-gold space-y-1.5 shadow-md">
              <span className="text-[10px] font-dnd-title font-bold text-dnd-crimson uppercase tracking-wide block">
                Selecciona tu d20 físico de la mesa:
              </span>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleApplyPhysical(num)}
                    className={`py-1 rounded text-xs font-dnd-title font-bold transition ${
                      num === 20
                        ? 'bg-dnd-gold text-dnd-leather-dark hover:bg-dnd-gold-light font-bold'
                        : num === 1
                          ? 'bg-dnd-crimson text-white hover:bg-dnd-crimson-hover'
                          : num >= 10
                            ? 'bg-[#15803d] text-white hover:bg-[#166534]'
                            : 'bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink hover:border-dnd-gold'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {lastRollMessage && (
            <div className="text-[10px] font-dnd-body italic text-center text-dnd-crimson bg-dnd-parchment-contrast py-1 px-2 rounded border border-dnd-border-antique">
              {lastRollMessage}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 pt-1">
        {/* Éxitos (3 Orbes Encadenados Canónicos ○─○─○) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-dnd-title font-bold text-[#15803d] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Éxitos
          </span>
          <div className="relative flex items-center justify-between w-28">
            <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-dnd-border-antique -translate-y-1/2" />
            {[0, 1, 2].map(idx => (
              <button
                key={idx}
                type="button"
                disabled={readOnly}
                onClick={() => handleToggleSuccess(idx)}
                className={`relative z-10 w-6 h-6 rounded-full border-2 transition flex items-center justify-center ${
                  idx < successes
                    ? 'bg-[#15803d] border-[#166534] shadow-sm'
                    : 'bg-dnd-parchment-dark border-dnd-border-antique hover:border-[#15803d]'
                }`}
              >
                {idx < successes && <span className="w-2 h-2 rounded-full bg-dnd-parchment" />}
              </button>
            ))}
          </div>
        </div>

        {/* Fallos (3 Orbes Encadenados Canónicos ○─○─○) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-dnd-title font-bold text-dnd-crimson flex items-center gap-1">
            <Skull className="w-3.5 h-3.5" /> Fallos
          </span>
          <div className="relative flex items-center justify-between w-28">
            <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-dnd-border-antique -translate-y-1/2" />
            {[0, 1, 2].map(idx => (
              <button
                key={idx}
                type="button"
                disabled={readOnly}
                onClick={() => handleToggleFailure(idx)}
                className={`relative z-10 w-6 h-6 rounded-full border-2 transition flex items-center justify-center ${
                  idx < failures
                    ? 'bg-dnd-crimson border-dnd-crimson-hover shadow-sm'
                    : 'bg-dnd-parchment-dark border-dnd-border-antique hover:border-dnd-crimson'
                }`}
              >
                {idx < failures && <span className="w-2 h-2 rounded-full bg-dnd-parchment" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
