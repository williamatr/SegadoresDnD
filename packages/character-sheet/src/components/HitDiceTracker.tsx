import React, { useState } from 'react';
import { Dices, Sun, Moon, Heart, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface HitDiceTrackerProps {
  hitDiceTotal: string;
  hitDiceCurrent: number;
  totalLevel: number;
  conModifier?: number;
  currentHp?: number;
  maxHp?: number;
  tempHp?: number;
  onUpdateHp?: (currentHp: number, tempHp: number) => void;
  onUpdateHitDice?: (current: number) => void;
  onShortRest?: () => void;
  onLongRest?: () => void;
  readOnly?: boolean;
}

interface LastRoll {
  roll: number;
  conMod: number;
  healing: number;
  dieSides: number;
  timestamp: number;
  isPhysical?: boolean;
}

export function HitDiceTracker({
  hitDiceTotal,
  hitDiceCurrent,
  totalLevel,
  conModifier = 0,
  currentHp = 10,
  maxHp = 10,
  tempHp = 0,
  onUpdateHp,
  onUpdateHitDice,
  onShortRest,
  onLongRest,
  readOnly = false
}: HitDiceTrackerProps) {
  const current = Math.max(0, Math.min(totalLevel, hitDiceCurrent));
  const [lastRoll, setLastRoll] = useState<LastRoll | null>(null);
  const [restModal, setRestModal] = useState<'short' | 'long' | null>(null);

  // Extraer el tipo de dado (d6, d8, d10, d12) de la cadena hitDiceTotal
  const match = hitDiceTotal.match(/d(\d+)/i);
  const dieSides = match ? parseInt(match[1], 10) : 8;

  // Estado para tirada física en mesa
  const [showPhysicalInput, setShowPhysicalInput] = useState<boolean>(false);
  const [physicalRollValue, setPhysicalRollValue] = useState<number>(Math.ceil(dieSides / 2));

  // Acción: Lanzar Dado de Golpe digital para curarse en descanso corto
  const handleRollHitDie = () => {
    if (readOnly || current <= 0) return;

    // Tirada aleatoria del dado de golpe (1 a dieSides)
    const roll = Math.floor(Math.random() * dieSides) + 1;
    // En D&D 5e / 5.5e: Curación = Tirada + Modificador de CON (mínimo 1)
    const healing = Math.max(1, roll + conModifier);
    const newHp = Math.min(maxHp, currentHp + healing);

    // Actualizar estado en la ficha
    onUpdateHitDice?.(current - 1);
    onUpdateHp?.(newHp, tempHp);

    setLastRoll({
      roll,
      conMod: conModifier,
      healing,
      dieSides,
      timestamp: Date.now(),
      isPhysical: false
    });
  };

  // Acción: Aplicar Dado de Golpe tirado físicamente en la mesa
  const handleApplyPhysicalHitDie = () => {
    if (readOnly || current <= 0) return;
    const roll = Math.max(1, Math.min(dieSides, physicalRollValue));
    const healing = Math.max(1, roll + conModifier);
    const newHp = Math.min(maxHp, currentHp + healing);

    onUpdateHitDice?.(current - 1);
    onUpdateHp?.(newHp, tempHp);

    setLastRoll({
      roll,
      conMod: conModifier,
      healing,
      dieSides,
      timestamp: Date.now(),
      isPhysical: true
    });
    setShowPhysicalInput(false);
  };

  const triggerShortRest = () => {
    onShortRest?.();
    setRestModal('short');
  };

  const triggerLongRest = () => {
    onLongRest?.();
    setRestModal('long');
    setLastRoll(null);
  };

  return (
    <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-3 shadow-md relative">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dices className="w-4 h-4 text-dnd-gold" />
          <h4 className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wider">
            Dados de Golpe y Descansos
          </h4>
        </div>
        <span className="font-dnd-title text-xs font-bold text-dnd-ink">
          <span className="text-dnd-crimson font-black">{current}</span> / {totalLevel} <span className="text-[11px] text-dnd-ink-muted font-normal font-dnd-body">({hitDiceTotal})</span>
        </span>
      </div>

      {/* Botones de Tirar Dado de Golpe (Digital o Físico en Mesa) con curación en vivo */}
      {!readOnly && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Opción A: Tirada digital automática */}
            <button
              type="button"
              disabled={current <= 0 || currentHp >= maxHp}
              onClick={handleRollHitDie}
              className="py-2 px-2.5 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique text-xs font-dnd-title font-bold uppercase tracking-wider text-dnd-crimson disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs flex items-center justify-center gap-1.5 group"
              title={
                current <= 0
                  ? 'No te quedan dados de golpe'
                  : currentHp >= maxHp
                  ? 'Tus PG ya están al máximo'
                  : `Tirada digital: 1d${dieSides} + ${conModifier} (CON)`
              }
            >
              <Dices className="w-3.5 h-3.5 text-dnd-gold group-hover:rotate-180 transition-transform duration-300" />
              <span>Tirar Digital (1d{dieSides})</span>
            </button>

            {/* Opción B: Tirada física en mesa */}
            <button
              type="button"
              disabled={current <= 0 || currentHp >= maxHp}
              onClick={() => setShowPhysicalInput(!showPhysicalInput)}
              className={`py-2 px-2.5 rounded-sm border text-xs font-dnd-title font-bold uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-1.5 ${
                showPhysicalInput
                  ? 'bg-dnd-gold/20 border-dnd-gold text-dnd-gold font-bold shadow-sm'
                  : 'bg-dnd-parchment-contrast hover:bg-dnd-parchment border-dnd-border-antique text-dnd-ink'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title="Abre el selector para introducir el número que sacaste en tu dado físico en la mesa"
            >
              <Sparkles className="w-3.5 h-3.5 text-dnd-terracotta" />
              <span>Tiré en Mesa 🎲</span>
            </button>
          </div>

          {/* Panel para ingresar resultado de dado físico en la mesa */}
          {showPhysicalInput && !readOnly && current > 0 && currentHp < maxHp && (
            <div className="p-3 rounded-sm bg-dnd-parchment-dark border-2 border-dnd-gold space-y-2.5 shadow-md animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-dnd-title font-bold text-dnd-crimson uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-dnd-gold" />
                  Dado físico en mesa (1d{dieSides})
                </span>
                <span className="text-[10px] text-dnd-ink-muted font-dnd-body">
                  Mod. CON: <strong className="text-dnd-ink font-dnd-title">{conModifier >= 0 ? `+${conModifier}` : conModifier}</strong>
                </span>
              </div>

              {/* Selector de número sacado en la mesa */}
              <div className="flex items-center gap-1 flex-wrap">
                {Array.from({ length: dieSides }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPhysicalRollValue(num)}
                    className={`w-7 h-7 rounded text-xs font-dnd-title font-bold transition flex items-center justify-center ${
                      physicalRollValue === num
                        ? 'bg-dnd-crimson text-white shadow-sm ring-1 ring-dnd-gold'
                        : 'bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink hover:border-dnd-gold'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-dnd-border-antique text-xs">
                <span className="text-dnd-ink-muted text-[11px] font-dnd-body">
                  Cura calculada: <strong className="text-[#15803d] font-dnd-title font-bold">+{Math.max(1, physicalRollValue + conModifier)} PG</strong>
                </span>
                <button
                  type="button"
                  onClick={handleApplyPhysicalHitDie}
                  className="px-3 py-1 rounded-sm bg-[#15803d] hover:bg-[#166534] text-white font-dnd-title font-bold text-[11px] uppercase tracking-wider transition shadow-sm flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Aplicar Curación en Mesa
                </button>
              </div>
            </div>
          )}

          {/* Notificación de Última Tirada de Curación */}
          {lastRoll && (
            <div className="p-2.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-gold text-[11px] text-dnd-ink flex items-center justify-between animate-in fade-in slide-in-from-top-1 shadow-xs">
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-dnd-crimson fill-dnd-crimson" />
                <span className="font-dnd-body">
                  {lastRoll.isPhysical ? '🎲 En la mesa:' : '🎲 Digital:'} sacaste <strong>1d{lastRoll.dieSides} ({lastRoll.roll})</strong> {lastRoll.conMod >= 0 ? `+${lastRoll.conMod}` : lastRoll.conMod} CON = <strong className="text-[#15803d] font-dnd-title font-bold">+{lastRoll.healing} PG</strong>
                </span>
              </div>
              <span className="font-dnd-title text-xs text-dnd-crimson font-bold">
                Vida: {currentHp}/{maxHp}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Botones de Descanso */}
      {!readOnly && (
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dnd-border-antique/80">
          <button
            type="button"
            onClick={triggerShortRest}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-gold text-dnd-gold text-xs font-dnd-title font-bold uppercase tracking-wider transition shadow-xs"
            title="Descanso Corto (1 hora): Restaura poderes de descanso corto (Acción Súbita, Nuevas Energías, Forma Salvaje) y permite curarse tirando dados de golpe"
          >
            <Sun className="w-3.5 h-3.5 text-dnd-gold" />
            Descanso Corto (1 h)
          </button>
          <button
            type="button"
            onClick={triggerLongRest}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover border border-dnd-crimson text-white text-xs font-dnd-title font-bold uppercase tracking-wider transition shadow-sm"
            title="Descanso Largo (8 h): Restaura el 100% de PG, recupera la mitad de dados de golpe, ranuras de magia y reduce 1 nivel de agotamiento"
          >
            <Moon className="w-3.5 h-3.5 text-dnd-gold-light" />
            Descanso Largo (8 h)
          </button>
        </div>
      )}

      {/* MODAL / BANNER DE DESCANSO CORTO */}
      {restModal === 'short' && (
        <div className="p-3.5 rounded-lg bg-dnd-parchment-dark border border-dnd-gold text-left space-y-2.5 animate-in fade-in shadow-md">
          <div className="flex items-center justify-between border-b border-dnd-border-antique pb-2">
            <div className="flex items-center gap-2 text-dnd-gold font-dnd-title font-bold text-xs uppercase tracking-wide">
              <Sun className="w-4 h-4 text-dnd-gold" />
              ¡Descanso Corto Completado! (1 Hora)
            </div>
            <button
              onClick={() => setRestModal(null)}
              className="p-1 rounded hover:bg-dnd-parchment-contrast text-dnd-ink-muted hover:text-dnd-ink transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 text-xs text-dnd-ink font-dnd-body leading-relaxed">
            <div className="flex items-center gap-1.5 text-[#15803d] font-semibold text-xs font-dnd-title">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d]" />
              Recursos de descanso corto recargados al 100%
            </div>
            <p className="text-xs text-dnd-ink-muted">
              Tus habilidades de recuperación por hora (como <em>Acción Súbita</em>, <em>Nuevas Energías</em>, <em>Forma Salvaje / Esporas</em> o <em>Recuperación Arcana</em>) ya están listas para volver a usarse.
            </p>
          </div>

          {currentHp < maxHp && current > 0 && (
            <div className="p-2.5 rounded-md bg-dnd-parchment-contrast border border-dnd-border-antique text-xs text-dnd-ink space-y-1.5">
              <span className="block font-dnd-title font-bold text-dnd-crimson uppercase">¿Necesitas recuperar vida?</span>
              <p className="text-dnd-ink-muted text-xs font-dnd-body">
                En D&D, durante un descanso corto no te curas automáticamente; debes vendarte tirando dados de golpe:
              </p>
              <button
                type="button"
                onClick={handleRollHitDie}
                className="w-full py-1.5 px-2 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white font-dnd-title font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Dices className="w-3.5 h-3.5 text-dnd-gold" />
                Tirar 1d{dieSides}{conModifier >= 0 ? `+${conModifier}` : conModifier} ({current} dados disponibles)
              </button>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setRestModal(null)}
              className="px-3 py-1 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique hover:border-dnd-gold text-xs font-dnd-title font-bold text-dnd-ink-muted hover:text-dnd-ink uppercase tracking-wider transition"
            >
              Reanudar Aventura
            </button>
          </div>
        </div>
      )}

      {/* MODAL / BANNER DE DESCANSO LARGO */}
      {restModal === 'long' && (
        <div className="p-3.5 rounded-sm bg-dnd-parchment-dark border-2 border-dnd-crimson text-left space-y-2.5 animate-in fade-in shadow-md">
          <div className="flex items-center justify-between border-b border-dnd-border-antique pb-2">
            <div className="flex items-center gap-2 text-dnd-crimson font-dnd-title font-bold text-xs uppercase tracking-wide">
              <Moon className="w-4 h-4 text-dnd-gold" />
              ¡Descanso Largo Completado! (8 Horas)
            </div>
            <button
              onClick={() => setRestModal(null)}
              className="p-1 rounded hover:bg-dnd-parchment-contrast text-dnd-ink-muted hover:text-dnd-ink transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-dnd-ink font-dnd-body">
            <div className="flex items-center gap-1.5 text-[#15803d] font-semibold text-[11px] font-dnd-title">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d]" />
              Puntos de Golpe restaurados al 100% ({maxHp} PG)
            </div>
            <div className="flex items-center gap-1.5 text-[#15803d] font-semibold text-[11px] font-dnd-title">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d]" />
              Ranuras de conjuro y poderes diarios restablecidos
            </div>
            <div className="flex items-center gap-1.5 text-[#15803d] font-semibold text-[11px] font-dnd-title">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d]" />
              Dados de Golpe recuperados (+{Math.max(1, Math.floor(totalLevel / 2))} dados)
            </div>
            <div className="flex items-center gap-1.5 text-[#15803d] font-semibold text-[11px] font-dnd-title">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d]" />
              Fatiga / Agotamiento reducido en 1 nivel
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setRestModal(null)}
              className="px-3 py-1 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white border border-dnd-crimson text-xs font-dnd-title font-bold uppercase tracking-wider transition shadow-sm"
            >
              Nuevo Día de Campaña
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
