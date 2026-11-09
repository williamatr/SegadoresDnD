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

  // Color de la barra de vida reactivo (Carmesí profundo con gradiente de vitalidad)
  let barColor = 'bg-gradient-to-r from-[#58180D] to-[#7a2021]';
  if (currentHp === 0) barColor = 'bg-red-950';
  else if (hpPercent <= 25) barColor = 'bg-red-800 animate-pulse';
  else if (hpPercent <= 50) barColor = 'bg-[#c45b1d]';

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] dnd-notched space-y-4 shadow-md">
      {/* Encabezado de Puntos de Golpe */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className={`w-5 h-5 ${currentHp === 0 ? 'text-[#58180D] animate-pulse' : 'text-[#58180D]'}`} />
          <h3 className="font-dnd-title font-bold text-base text-[#58180D] tracking-wide">
            Puntos de Golpe (PG)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {tempHp > 0 && (
            <span className="px-2.5 py-0.5 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] text-cyan-800 font-bold font-dnd-title">
              +{tempHp} Temp
            </span>
          )}
          <span className="font-dnd-title text-base font-bold text-[#242528]">
            <span className={currentHp === 0 ? 'text-[#58180D] font-black' : 'text-[#58180D] font-black'}>
              {currentHp}
            </span>
            <span className="text-[#58544d]"> / </span>
            <span className="text-[#58544d]">{maxHp}</span>
          </span>
        </div>
      </div>

      {/* Barra de Progreso de Salud */}
      <div className="space-y-1">
        <div className="h-3.5 w-full bg-[#ede2cb] rounded-full overflow-hidden border border-[#d4c2a5] p-0.5 relative">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#58544d] px-1 font-dnd-body">
          <span>{currentHp === 0 ? '💀 Inconsciente (0 PG)' : hpPercent <= 50 ? '⚠️ Malherido (< 50%)' : 'En buen estado'}</span>
          <span className="font-dnd-title font-bold">{hpPercent}%</span>
        </div>
      </div>

      {/* Alerta de Herida Reactiva */}
      {lastDamageAlert && (
        <div
          className={`p-3 rounded-sm border flex items-start justify-between gap-3 text-xs animate-in fade-in ${
            lastDamageAlert.type === 'zero'
              ? 'bg-[#58180D] text-[#fdf6ea] border-[#7a2021]'
              : 'bg-[#ede2cb] text-[#58180D] border-[#c45b1d]'
          }`}
        >
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#e5b960]" />
            <div>
              <p className="font-dnd-title font-bold">{lastDamageAlert.message}</p>
              <span className="text-[10px] opacity-90 block mt-0.5 font-dnd-body">
                Regla de mesa: Las heridas graves o estrés masivo alteran el combate.
              </span>
            </div>
          </div>
          <button
            onClick={() => onTriggerInjuryTable?.(lastDamageAlert.table)}
            className="px-2.5 py-1 rounded-sm bg-[#c29b38] hover:bg-[#a88225] text-[#1b120e] text-[11px] font-dnd-title font-bold shrink-0 transition shadow-sm"
          >
            Tirar Tabla {lastDamageAlert.table}
          </button>
        </div>
      )}

      {/* Botones de Control Táctil Rápido */}
      {!readOnly && (
        <div className="space-y-3 pt-1 border-t border-[#d4c2a5]/80">
          <div className="grid grid-cols-4 gap-1.5 text-xs">
            <button
              onClick={() => handleApplyDamage(5)}
              className="py-1.5 px-2 rounded-sm bg-[#ede2cb] hover:bg-[#d4c2a5] border border-[#d4c2a5] text-[#58180D] font-dnd-title font-bold flex items-center justify-center gap-1 transition shadow-sm"
              title="Recibir 5 de daño"
            >
              <Minus className="w-3 h-3" /> 5 Daño
            </button>
            <button
              onClick={() => handleApplyDamage(1)}
              className="py-1.5 px-2 rounded-sm bg-[#ede2cb] hover:bg-[#d4c2a5] border border-[#d4c2a5] text-[#58180D] font-dnd-title font-bold flex items-center justify-center gap-1 transition shadow-sm"
              title="Recibir 1 de daño"
            >
              <Minus className="w-3 h-3" /> 1 Daño
            </button>
            <button
              onClick={() => handleApplyHeal(1)}
              className="py-1.5 px-2 rounded-sm bg-[#ede2cb] hover:bg-[#d4c2a5] border border-[#d4c2a5] text-[#15803d] font-dnd-title font-bold flex items-center justify-center gap-1 transition shadow-sm"
              title="Curar 1 PG"
            >
              <Plus className="w-3 h-3" /> 1 Cura
            </button>
            <button
              onClick={() => handleApplyHeal(5)}
              className="py-1.5 px-2 rounded-sm bg-[#ede2cb] hover:bg-[#d4c2a5] border border-[#d4c2a5] text-[#15803d] font-dnd-title font-bold flex items-center justify-center gap-1 transition shadow-sm"
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
              className="w-24 px-2.5 py-1.5 rounded-sm bg-[#fdf6ea] border border-[#d4c2a5] text-[#242528] text-xs font-dnd-title font-bold focus:outline-none focus:border-[#58180D]"
            />
            <button
              onClick={() => {
                const val = parseInt(customAmount, 10);
                if (!isNaN(val) && val > 0) handleApplyDamage(val);
              }}
              disabled={!customAmount}
              className="flex-1 py-1.5 px-2.5 rounded-sm bg-[#58180D] hover:bg-[#7a2021] text-[#fdf6ea] text-xs font-dnd-title font-bold disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              Dañar
            </button>
            <button
              onClick={() => {
                const val = parseInt(customAmount, 10);
                if (!isNaN(val) && val > 0) handleApplyHeal(val);
              }}
              disabled={!customAmount}
              className="flex-1 py-1.5 px-2.5 rounded-sm bg-[#15803d] hover:bg-[#166534] text-[#fdf6ea] text-xs font-dnd-title font-bold disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              Curar
            </button>
            <button
              onClick={() => {
                const val = parseInt(customAmount, 10);
                if (!isNaN(val) && val >= 0) handleApplyTempHp(val);
              }}
              disabled={!customAmount}
              className="py-1.5 px-2.5 rounded-sm bg-[#ede2cb] hover:bg-[#d4c2a5] border border-[#d4c2a5] text-cyan-800 text-xs font-dnd-title font-bold disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              title="Establecer PG Temporales (no se acumulan, toma el mayor)"
            >
              +Temp
            </button>
            {tempHp > 0 && (
              <button
                onClick={handleClearTempHp}
                className="py-1.5 px-2 rounded-sm bg-[#ede2cb] hover:bg-[#d4c2a5] text-[#58180D] text-xs font-dnd-title font-bold transition"
                title="Quitar PG Temporales"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
