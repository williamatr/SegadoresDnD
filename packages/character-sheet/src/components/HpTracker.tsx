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
  let barColor = 'bg-gradient-to-r from-dnd-crimson to-dnd-crimson-hover';
  if (currentHp === 0) barColor = 'bg-red-950';
  else if (hpPercent <= 25) barColor = 'bg-red-800 animate-pulse';
  else if (hpPercent <= 50) barColor = 'bg-dnd-terracotta';

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-4 shadow-md">
      {/* Encabezado de Puntos de Golpe */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className={`w-5 h-5 ${currentHp === 0 ? 'text-dnd-crimson animate-pulse' : 'text-dnd-crimson'}`} />
          <h3 className="font-dnd-title font-bold text-base text-dnd-crimson tracking-wide">
            Puntos de Golpe (PG)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {tempHp > 0 && (
            <span className="px-2.5 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-cyan-700 dark:text-cyan-300 font-bold font-dnd-title">
              +{tempHp} Temp
            </span>
          )}
          <span className="font-dnd-title text-base font-bold text-dnd-ink">
            <span className={currentHp === 0 ? 'text-dnd-crimson font-black' : 'text-dnd-crimson font-black'}>
              {currentHp}
            </span>
            <span className="text-dnd-ink-muted"> / </span>
            <span className="text-dnd-ink-muted">{maxHp}</span>
          </span>
        </div>
      </div>

      {/* Barra de Progreso de Salud */}
      <div className="space-y-1">
        <div className="h-3.5 w-full bg-dnd-parchment-contrast rounded-full overflow-hidden border border-dnd-border-antique p-0.5 relative">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-dnd-ink-muted px-1 font-dnd-body">
          <span>{currentHp === 0 ? '💀 Inconsciente (0 PG)' : hpPercent <= 50 ? '⚠️ Malherido (< 50%)' : 'En buen estado'}</span>
          <span className="font-dnd-title font-bold">{hpPercent}%</span>
        </div>
      </div>

      {/* Alerta de Herida Reactiva */}
      {lastDamageAlert && (
        <div
          className={`p-3 rounded-md border flex items-start justify-between gap-3 text-xs animate-in fade-in ${
            lastDamageAlert.type === 'zero'
              ? 'bg-dnd-crimson text-white border-dnd-crimson-hover'
              : 'bg-dnd-parchment-contrast text-dnd-crimson border-dnd-terracotta'
          }`}
        >
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-dnd-gold-light" />
            <div>
              <p className="font-dnd-title font-bold">{lastDamageAlert.message}</p>
              <span className="text-xs opacity-90 block mt-0.5 font-dnd-body">
                Regla de mesa: Las heridas graves o estrés masivo alteran el combate.
              </span>
            </div>
          </div>
          <button
            onClick={() => onTriggerInjuryTable?.(lastDamageAlert.table)}
            className="px-2.5 py-1 rounded-sm bg-dnd-gold hover:bg-[#a88225] text-dnd-leather-dark text-[11px] font-dnd-title font-bold shrink-0 transition shadow-sm"
          >
            Tirar Tabla {lastDamageAlert.table}
          </button>
        </div>
      )}

      {/* Botones de Control Táctil Rápido */}
      {!readOnly && (
        <div className="space-y-3 pt-1 border-t border-dnd-border-antique/80">
          <div className="grid grid-cols-4 gap-1.5 text-xs">
            <button
              onClick={() => handleApplyDamage(5)}
              className="py-1.5 px-2 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique text-dnd-crimson font-dnd-title font-bold flex items-center justify-center gap-1 transition shadow-sm"
              title="Recibir 5 de daño"
            >
              <Minus className="w-3 h-3" /> 5 Daño
            </button>
            <button
              onClick={() => handleApplyDamage(1)}
              className="py-1.5 px-2 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique text-dnd-crimson font-dnd-title font-bold flex items-center justify-center gap-1 transition shadow-sm"
              title="Recibir 1 de daño"
            >
              <Minus className="w-3 h-3" /> 1 Daño
            </button>
            <button
              onClick={() => handleApplyHeal(1)}
              className="py-1.5 px-2 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique text-[#15803d] font-dnd-title font-bold flex items-center justify-center gap-1 transition shadow-sm"
              title="Curar 1 PG"
            >
              <Plus className="w-3 h-3" /> 1 Cura
            </button>
            <button
              onClick={() => handleApplyHeal(5)}
              className="py-1.5 px-2 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique text-[#15803d] font-dnd-title font-bold flex items-center justify-center gap-1 transition shadow-sm"
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
              className="w-24 px-2.5 py-1.5 rounded-sm bg-dnd-parchment border border-dnd-border-antique text-dnd-ink text-xs font-dnd-title font-bold focus:outline-none focus:border-dnd-crimson"
            />
            <button
              onClick={() => {
                const val = parseInt(customAmount, 10);
                if (!isNaN(val) && val > 0) handleApplyDamage(val);
              }}
              disabled={!customAmount}
              className="flex-1 py-1.5 px-2.5 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white text-xs font-dnd-title font-bold disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              Dañar
            </button>
            <button
              onClick={() => {
                const val = parseInt(customAmount, 10);
                if (!isNaN(val) && val > 0) handleApplyHeal(val);
              }}
              disabled={!customAmount}
              className="flex-1 py-1.5 px-2.5 rounded-sm bg-[#15803d] hover:bg-[#166534] text-white text-xs font-dnd-title font-bold disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              Curar
            </button>
            <button
              onClick={() => {
                const val = parseInt(customAmount, 10);
                if (!isNaN(val) && val >= 0) handleApplyTempHp(val);
              }}
              disabled={!customAmount}
              className="py-1.5 px-2.5 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique text-cyan-700 dark:text-cyan-300 text-xs font-dnd-title font-bold disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              title="Establecer PG Temporales (no se acumulan, toma el mayor)"
            >
              +Temp
            </button>
            {tempHp > 0 && (
              <button
                onClick={handleClearTempHp}
                className="py-1.5 px-2 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment text-dnd-crimson text-xs font-dnd-title font-bold transition"
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
