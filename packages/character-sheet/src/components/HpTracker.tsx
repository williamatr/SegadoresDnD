import React, { useState } from 'react';
import { Heart, ShieldAlert, Sparkles, Plus, Minus, Skull, Flame } from 'lucide-react';
import type { Character } from '@segadores/dnd-core';

interface HpTrackerProps {
  character: Character;
  onUpdateHp?: (currentHp: number, tempHp: number) => void;
  onTriggerInjuryTable?: (table: 'A' | 'B') => void;
  readOnly?: boolean;
}

export function HpTracker({
  character,
  onUpdateHp,
  onTriggerInjuryTable,
  readOnly = false
}: HpTrackerProps) {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [lastDamageAlert, setLastDamageAlert] = useState<{
    type: 'massive' | 'zero';
    message: string;
    table: 'A' | 'B';
  } | null>(null);

  const currentHp = Math.max(0, character.current_hp);
  const maxHp = Math.max(1, character.max_hp);
  const tempHp = Math.max(0, character.temp_hp || 0);

  const hpPercent = Math.min(100, Math.round((currentHp / maxHp) * 100));

  const handleApplyDamage = (amount: number) => {
    if (readOnly || amount <= 0) return;

    let remainingDmg = amount;
    let newTempHp = tempHp;
    let newCurrentHp = currentHp;

    if (newTempHp > 0) {
      if (newTempHp >= remainingDmg) {
        newTempHp -= remainingDmg;
        remainingDmg = 0;
      } else {
        remainingDmg -= newTempHp;
        newTempHp = 0;
      }
    }

    if (remainingDmg > 0) {
      newCurrentHp = Math.max(0, newCurrentHp - remainingDmg);
    }

    // Comprobar si se dispara Tabla B (0 PG) o Tabla A (> 50% de PG de un solo golpe)
    if (newCurrentHp === 0 && currentHp > 0) {
      setLastDamageAlert({
        type: 'zero',
        message: '¡El personaje ha caído a 0 Puntos de Golpe! Debe tirar en la Tabla B (Heridas Graves).',
        table: 'B'
      });
      onTriggerInjuryTable?.('B');
    } else if (amount > maxHp / 2 && newCurrentHp > 0) {
      setLastDamageAlert({
        type: 'massive',
        message: `¡Daño masivo de ${amount} PG (> 50% del máximo)! Debe tirar en la Tabla A (Heridas Menores).`,
        table: 'A'
      });
      onTriggerInjuryTable?.('A');
    }

    onUpdateHp?.(newCurrentHp, newTempHp);
    setCustomAmount('');
  };

  const handleApplyHeal = (amount: number) => {
    if (readOnly || amount <= 0) return;
    const newCurrentHp = Math.min(maxHp, currentHp + amount);
    onUpdateHp?.(newCurrentHp, tempHp);
    setCustomAmount('');
    setLastDamageAlert(null);
  };

  const handleApplyTempHp = (amount: number) => {
    if (readOnly || amount < 0) return;
    // En D&D los PG temporales no se acumulan: se toma el mayor
    const newTemp = Math.max(tempHp, amount);
    onUpdateHp?.(currentHp, newTemp);
    setCustomAmount('');
  };

  const handleClearTempHp = () => {
    if (readOnly) return;
    onUpdateHp?.(currentHp, 0);
  };

  // Color de la barra de vida reactivo
  let barColor = 'bg-emerald-500';
  if (currentHp === 0) barColor = 'bg-red-900';
  else if (hpPercent <= 25) barColor = 'bg-red-500';
  else if (hpPercent <= 50) barColor = 'bg-amber-500';

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-dnd-card border border-dnd-border space-y-4 shadow-md">
      {/* Encabezado de Puntos de Golpe */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className={`w-5 h-5 ${currentHp === 0 ? 'text-red-500 animate-pulse' : 'text-red-400'}`} />
          <h3 className="font-fantasy font-bold text-base text-slate-100 tracking-wide">
            Puntos de Golpe (PG)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {tempHp > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-700/60 text-cyan-300 font-bold font-mono">
              +{tempHp} Temp
            </span>
          )}
          <span className="font-mono text-sm font-bold text-slate-200">
            <span className={currentHp === 0 ? 'text-red-400 font-extrabold' : 'text-emerald-400'}>
              {currentHp}
            </span>
            <span className="text-slate-500"> / </span>
            <span className="text-slate-400">{maxHp}</span>
          </span>
        </div>
      </div>

      {/* Barra de Progreso de Salud */}
      <div className="space-y-1">
        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 relative">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>{currentHp === 0 ? '💀 Inconsciente (0 PG)' : hpPercent <= 50 ? '⚠️ Malherido (< 50%)' : 'En buen estado'}</span>
          <span className="font-mono">{hpPercent}%</span>
        </div>
      </div>

      {/* Alerta de Herida Reactiva */}
      {lastDamageAlert && (
        <div
          className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs animate-in fade-in ${
            lastDamageAlert.type === 'zero'
              ? 'bg-red-950/60 border-red-700/70 text-red-200'
              : 'bg-amber-950/60 border-amber-700/70 text-amber-200'
          }`}
        >
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-semibold">{lastDamageAlert.message}</p>
              <span className="text-[10px] text-slate-300 block mt-0.5">
                Regla de mesa: Las heridas graves o estrés masivo alteran el combate.
              </span>
            </div>
          </div>
          <button
            onClick={() => onTriggerInjuryTable?.(lastDamageAlert.table)}
            className="px-2.5 py-1 rounded-lg bg-red-900/80 hover:bg-red-800 border border-red-600 text-[11px] font-bold text-white shrink-0 transition"
          >
            Tirar Tabla {lastDamageAlert.table}
          </button>
        </div>
      )}

      {/* Botones de Control Táctil Rápido */}
      {!readOnly && (
        <div className="space-y-3 pt-1 border-t border-dnd-border/60">
          <div className="grid grid-cols-4 gap-1.5 text-xs">
            <button
              onClick={() => handleApplyDamage(5)}
              className="py-1.5 px-2 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-800/50 text-red-300 font-mono font-semibold flex items-center justify-center gap-1 transition"
              title="Recibir 5 de daño"
            >
              <Minus className="w-3 h-3" /> 5 Daño
            </button>
            <button
              onClick={() => handleApplyDamage(1)}
              className="py-1.5 px-2 rounded-lg bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 text-red-300 font-mono font-semibold flex items-center justify-center gap-1 transition"
              title="Recibir 1 de daño"
            >
              <Minus className="w-3 h-3" /> 1 Daño
            </button>
            <button
              onClick={() => handleApplyHeal(1)}
              className="py-1.5 px-2 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 font-mono font-semibold flex items-center justify-center gap-1 transition"
              title="Curar 1 PG"
            >
              <Plus className="w-3 h-3" /> 1 Cura
            </button>
            <button
              onClick={() => handleApplyHeal(5)}
              className="py-1.5 px-2 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/50 text-emerald-300 font-mono font-semibold flex items-center justify-center gap-1 transition"
              title="Curar 5 PG"
            >
              <Plus className="w-3 h-3" /> 5 Cura
            </button>
          </div>

          {/* Formulario de Cantidad Personalizada */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="999"
              placeholder="Cantidad..."
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-dnd-border text-slate-100 text-xs font-mono focus:outline-none focus:border-dnd-gold"
            />
            <button
              onClick={() => {
                const val = parseInt(customAmount, 10);
                if (!isNaN(val) && val > 0) handleApplyDamage(val);
              }}
              disabled={!customAmount}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-700/60 text-red-200 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Dañar
            </button>
            <button
              onClick={() => {
                const val = parseInt(customAmount, 10);
                if (!isNaN(val) && val > 0) handleApplyHeal(val);
              }}
              disabled={!customAmount}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Curar
            </button>
            <button
              onClick={() => {
                const val = parseInt(customAmount, 10);
                if (!isNaN(val) && val > 0) handleApplyTempHp(val);
              }}
              disabled={!customAmount}
              className="py-1.5 px-2.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-200 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Añadir PG Temporales"
            >
              +Temp
            </button>
            {tempHp > 0 && (
              <button
                onClick={handleClearTempHp}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                title="Quitar PG Temporales"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
