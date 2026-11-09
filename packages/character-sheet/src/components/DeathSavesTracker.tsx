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
    <div className="p-4 rounded-sm bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] dnd-notched space-y-3 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skull className={`w-4 h-4 ${isDead ? 'text-[#58180D] animate-bounce' : 'text-[#58544d]'}`} />
          <h4 className="font-dnd-title font-bold text-xs text-[#58180D] uppercase tracking-wider">
            Salvaciones contra la Muerte
          </h4>
        </div>
        {!readOnly && (successes > 0 || failures > 0) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] font-dnd-title text-[#58544d] hover:text-[#58180D] transition"
            title="Reiniciar salvaciones"
          >
            <RotateCcw className="w-3 h-3" /> Reiniciar
          </button>
        )}
      </div>

      {/* Estados extremos */}
      {isDead && (
        <div className="p-2.5 rounded-sm bg-[#58180D] border border-[#7a2021] text-[#fdf6ea] text-xs font-dnd-title font-bold text-center animate-pulse shadow-md">
          💀 ¡3 Fallos! El personaje ha sucumbido a la muerte.
        </div>
      )}
      {isStabilized && !isDead && (
        <div className="p-2.5 rounded-sm bg-[#15803d] border border-[#166534] text-[#fdf6ea] text-xs font-dnd-title font-bold text-center shadow-md">
          ✨ ¡3 Éxitos! El personaje está estabilizado (0 PG inconsciente).
        </div>
      )}

      {/* Selector de Dados (Digital o Tirado en Mesa Físico) */}
      {!readOnly && !isDead && !isStabilized && (
        <div className="space-y-2 pt-1 border-t border-[#d4c2a5]/80">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleRollDigital}
              className="py-1 px-2 rounded-sm bg-[#ede2cb] hover:bg-[#d4c2a5] border border-[#d4c2a5] text-[#58180D] text-[11px] font-dnd-title font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
              title="Tirar 1d20 digital"
            >
              <Dices className="w-3 h-3 text-[#c29b38]" />
              <span>Tirar Digital</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPhysicalEntry(!showPhysicalEntry)}
              className={`py-1 px-2 rounded-sm border text-[11px] font-dnd-title font-bold flex items-center justify-center gap-1.5 transition ${
                showPhysicalEntry
                  ? 'bg-[#c29b38]/30 border-[#c29b38] text-[#854d0e] shadow-sm'
                  : 'bg-[#ede2cb] hover:bg-[#d4c2a5] border-[#d4c2a5] text-[#242528]'
              }`}
              title="Registrar tirada física en mesa"
            >
              <span>🎲 Tiré en Mesa</span>
            </button>
          </div>

          {/* Botonera de 1 al 20 para el d20 físico tirado en la mesa */}
          {showPhysicalEntry && (
            <div className="p-2.5 rounded-sm bg-[#f4ebe1] border-2 border-[#c29b38] space-y-1.5 shadow-md">
              <span className="text-[10px] font-dnd-title font-bold text-[#58180D] uppercase tracking-wide block">
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
                        ? 'bg-[#c29b38] text-[#1b120e] hover:bg-[#a88225]'
                        : num === 1
                          ? 'bg-[#58180D] text-white hover:bg-[#7a2021]'
                          : num >= 10
                            ? 'bg-[#15803d] text-white hover:bg-[#166534]'
                            : 'bg-[#ede2cb] border border-[#d4c2a5] text-[#242528] hover:border-[#c29b38]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {lastRollMessage && (
            <div className="text-[10px] font-dnd-body italic text-center text-[#58180D] bg-[#ede2cb] py-1 px-2 rounded border border-[#d4c2a5]">
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
            <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-[#d4c2a5] -translate-y-1/2" />
            {[0, 1, 2].map(idx => (
              <button
                key={idx}
                type="button"
                disabled={readOnly}
                onClick={() => handleToggleSuccess(idx)}
                className={`relative z-10 w-6 h-6 rounded-full border-2 transition flex items-center justify-center ${
                  idx < successes
                    ? 'bg-[#15803d] border-[#166534] shadow-sm'
                    : 'bg-[#f4ebe1] border-[#d4c2a5] hover:border-[#15803d]'
                }`}
              >
                {idx < successes && <span className="w-2 h-2 rounded-full bg-[#fdf6ea]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Fallos (3 Orbes Encadenados Canónicos ○─○─○) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-dnd-title font-bold text-[#58180D] flex items-center gap-1">
            <Skull className="w-3.5 h-3.5" /> Fallos
          </span>
          <div className="relative flex items-center justify-between w-28">
            <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-[#d4c2a5] -translate-y-1/2" />
            {[0, 1, 2].map(idx => (
              <button
                key={idx}
                type="button"
                disabled={readOnly}
                onClick={() => handleToggleFailure(idx)}
                className={`relative z-10 w-6 h-6 rounded-full border-2 transition flex items-center justify-center ${
                  idx < failures
                    ? 'bg-[#58180D] border-[#7a2021] shadow-sm'
                    : 'bg-[#f4ebe1] border-[#d4c2a5] hover:border-[#58180D]'
                }`}
              >
                {idx < failures && <span className="w-2 h-2 rounded-full bg-[#fdf6ea]" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
