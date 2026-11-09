import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  Sparkles,
  Plus,
  Trash2,
  Dices,
  AlertTriangle,
  Heart,
  CheckCircle2,
  Activity,
  Zap,
  Info
} from 'lucide-react';
import type { BaseViewProps } from '../types.ts';
import {
  TABLE_A_INJURIES,
  TABLE_B_INJURIES,
  createInjuryActiveEffect,
  CANONICAL_PARTY_BUFFS,
  CAMPAIGN_HERO_NAMES,
  filterAvailableBuffs,
  createActiveEffectFromBuff,
  type ActiveEffect,
  type StandardConditionId,
  type CharacterBuffDefinition
} from '@segadores/dnd-core';

const STANDARD_CONDITIONS_LIST: Array<{ id: StandardConditionId; name: string; description: string }> = [
  { id: 'agarrado', name: 'Agarrado', description: 'Velocidad reducida a 0 pies. Termina si el apresador es incapacitado o empujado.' },
  { id: 'apresado', name: 'Apresado', description: 'Velocidad 0. Ataques en tu contra tienen ventaja; tus ataques tienen desventaja; desventaja en TS de Destreza.' },
  { id: 'asustado', name: 'Asustado', description: 'Desventaja en pruebas de habilidad y ataques mientras la fuente del miedo esté en línea de visión. No puedes acercarte voluntariamente.' },
  { id: 'aturdido', name: 'Aturdido', description: 'Incapacitado, no puedes moverte y hablas titubeante. Fallas automáticamente TS de Fuerza y Destreza. Ataques en tu contra tienen ventaja.' },
  { id: 'cegado', name: 'Cegado', description: 'Fallas automáticamente pruebas de vista. Ataques en tu contra tienen ventaja; tus ataques tienen desventaja.' },
  { id: 'derribado', name: 'Derribado', description: 'Solo puedes gatear (cuesta el doble de movimiento). Desventaja en ataques. Ataques cuerpo a cuerpo a 5 pies en tu contra tienen ventaja.' },
  { id: 'ensordecido', name: 'Ensordecido', description: 'No puedes oír y fallas automáticamente pruebas que dependan del oído.' },
  { id: 'envenenado', name: 'Envenenado', description: 'Desventaja en tiradas de ataque y pruebas de característica.' },
  { id: 'hechizado', name: 'Hechizado', description: 'No puedes atacar al encantador y este tiene ventaja en pruebas sociales contigo.' },
  { id: 'incapacitado', name: 'Incapacitado', description: 'No puedes realizar acciones ni reacciones.' },
  { id: 'inconsciente', name: 'Inconsciente', description: 'Incapacitado, tirado en el suelo, sueltas lo que tengas en manos. Ataques a 5 pies son críticos automáticos.' },
  { id: 'invisible', name: 'Invisible', description: 'Imposible de ver sin magia o sentidos especiales. Tienes ventaja en ataques y ataques en tu contra tienen desventaja.' },
  { id: 'paralizado', name: 'Paralizado', description: 'Incapacitado y no puedes moverte ni hablar. Fallas TS de FUE y DES. Ataques a 5 pies son críticos automáticos.' },
  { id: 'petrificado', name: 'Petrificado', description: 'Transformado en sustancia sólida inerte. Resistencia a todo daño. Inmune a venenos y enfermedades.' },
  { id: 'silenciado', name: 'Silenciado', description: 'Inmune a daño de trueno y no puedes lanzar conjuros que requieran componente Verbal (V).' }
];

export function ConditionsAndEffectsView({
  character,
  readOnly = false,
  userRole = 'player',
  viewerCharacterSlug,
  onApplyEffect,
  onRemoveEffect
}: BaseViewProps) {
  const activeEffects = character.active_effects || [];

  // Estado del tirador de heridas
  const [selectedTable, setSelectedTable] = useState<'A' | 'B'>('A');
  const [injuryRoll, setInjuryRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [showPhysicalEntry, setShowPhysicalEntry] = useState<boolean>(false);

  // Contexto del observador y objetivo
  const isViewingSelf =
    (viewerCharacterSlug && viewerCharacterSlug === character.slug) ||
    (!viewerCharacterSlug && !readOnly);
  const isViewingAlly = Boolean(
    userRole === 'player' && viewerCharacterSlug && viewerCharacterSlug !== character.slug
  );
  const viewerHeroName = viewerCharacterSlug
    ? (CAMPAIGN_HERO_NAMES[viewerCharacterSlug] || viewerCharacterSlug)
    : null;

  // Filtrado canónico contextual de buffs disponibles
  const availableBuffs = filterAvailableBuffs(CANONICAL_PARTY_BUFFS, {
    userRole,
    targetCharacterSlug: character.slug,
    viewerCharacterSlug,
    readOnly
  });

  const handleRollInjury = () => {
    setIsRolling(true);
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 20) + 1;
      setInjuryRoll(roll);
      setIsRolling(false);
    }, 300);
  };

  const handleApplyRolledInjury = () => {
    if (injuryRoll === null || readOnly) return;
    const effect = createInjuryActiveEffect(selectedTable, injuryRoll, `Tirada Tabla ${selectedTable}`);
    if (effect) {
      onApplyEffect?.(effect);
    }
    setInjuryRoll(null);
  };

  const handleToggleCondition = (cond: typeof STANDARD_CONDITIONS_LIST[0]) => {
    if (readOnly) return;
    const existing = activeEffects.find(
      e => e.type === 'condition' && (e.conditionId === cond.id || e.name.toLowerCase() === cond.name.toLowerCase())
    );

    if (existing) {
      onRemoveEffect?.(existing.id);
    } else {
      const newEffect: ActiveEffect = {
        id: `cond-${cond.id}-${Date.now()}`,
        name: cond.name,
        type: 'condition',
        conditionId: cond.id,
        description: cond.description,
        applied_by: userRole === 'dm' ? 'Dungeon Master' : character.name,
        created_at: new Date().toISOString()
      };
      onApplyEffect?.(newEffect);
    }
  };

  const handleToggleBuff = (buff: CharacterBuffDefinition) => {
    // Si no tiene permisos, retornar (los aliados y DM pueden aplicar buffs incluso en readOnly)
    const canManageBuffs = !readOnly || userRole === 'dm' || isViewingAlly;
    if (!canManageBuffs) return;

    const existing = activeEffects.find(
      e => e.type === 'buff' && e.name.toLowerCase() === buff.name.toLowerCase()
    );

    if (existing) {
      onRemoveEffect?.(existing.id);
    } else {
      const appliedBy =
        userRole === 'dm'
          ? buff.ownerName
          : (isViewingAlly ? (viewerHeroName || buff.ownerName) : character.name);

      const newEffect = createActiveEffectFromBuff(buff, appliedBy);
      onApplyEffect?.(newEffect);
    }
  };

  // Obtener definición de la herida seleccionada para vista previa
  const tableData = selectedTable === 'A' ? TABLE_A_INJURIES : TABLE_B_INJURIES;
  const currentRolledDef = injuryRoll !== null
    ? tableData.find(d => injuryRoll >= d.minRoll && injuryRoll <= d.maxRoll)
    : null;

  return (
    <div className="space-y-6">
      {/* 1. Panel de Efectos Activos en el Personaje */}
      <div className="p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-dnd-gold" />
            <h3 className="font-dnd-title font-bold text-sm text-dnd-crimson uppercase tracking-wide">
              Efectos, Condiciones y Heridas Activas ({activeEffects.length})
            </h3>
          </div>
          <span className="text-[11px] text-dnd-ink-muted font-dnd-title font-semibold">
            Sincronización táctica en vivo
          </span>
        </div>

        {activeEffects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeEffects.map(effect => {
              const isInjury = effect.type === 'injury';
              const isCondition = effect.type === 'condition';
              const isBuff = effect.type === 'buff';

              return (
                <div
                  key={effect.id}
                  className={`p-3.5 rounded-sm border-2 transition flex flex-col justify-between space-y-2.5 ${
                    isInjury
                      ? 'bg-dnd-crimson-surface border-dnd-crimson text-dnd-crimson shadow-sm'
                      : isBuff
                      ? 'bg-emerald-900/10 border-emerald-600/40 text-emerald-700 dark:text-emerald-400'
                      : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-dnd-title font-bold text-sm uppercase tracking-wide">
                        {effect.name}
                      </span>
                      <span className="text-[10px] font-dnd-title font-bold uppercase px-2 py-0.5 rounded-sm border bg-dnd-parchment border-dnd-border-antique text-dnd-crimson">
                        {effect.type}
                      </span>
                    </div>
                    <p className="text-xs font-dnd-body mt-1 text-dnd-ink-muted">
                      {effect.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap text-[11px] font-sans text-dnd-ink-muted mt-2 pt-1 border-t border-dnd-border-antique/50">
                      {effect.applied_by && (
                        <span>
                          Aplicado por: <strong className="text-dnd-ink font-semibold">{effect.applied_by}</strong>
                        </span>
                      )}
                      {effect.duration && (
                        <span>• Duración: <strong className="text-dnd-ink font-semibold">{effect.duration}</strong></span>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const canRemove =
                      !readOnly ||
                      userRole === 'dm' ||
                      (isViewingAlly && isBuff && (
                        effect.applied_by === viewerHeroName ||
                        availableBuffs.some(b => b.name.toLowerCase() === effect.name.toLowerCase())
                      ));

                    if (!canRemove) return null;

                    return (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => onRemoveEffect?.(effect.id)}
                          className="text-[11px] font-dnd-title font-bold text-dnd-crimson hover:underline uppercase tracking-wider flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3 text-dnd-crimson" />
                          <span>Eliminar Efecto</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-center text-xs text-dnd-ink-muted font-dnd-body">
            ✨ El personaje no tiene ninguna condición, herida ni efecto negativo activo en este momento.
          </div>
        )}
      </div>

      {/* 2. Tirador Interactivo de Heridas de Combate (Tabla A y Tabla B) */}
      <div className="p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-dnd-crimson" />
            <h4 className="font-dnd-title font-bold text-xs uppercase tracking-wider text-dnd-crimson">
              Tirador de Heridas y Estrés de Combate (1d20 Oficial)
            </h4>
          </div>
          <div className="flex items-center gap-1.5 font-dnd-title">
            <button
              onClick={() => { setSelectedTable('A'); setInjuryRoll(null); }}
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border transition ${
                selectedTable === 'A'
                  ? 'bg-dnd-crimson border-dnd-gold text-white shadow-sm'
                  : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
              }`}
            >
              Tabla A (Menores)
            </button>
            <button
              onClick={() => { setSelectedTable('B'); setInjuryRoll(null); }}
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border transition ${
                selectedTable === 'B'
                  ? 'bg-dnd-crimson border-dnd-gold text-white shadow-sm'
                  : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink'
              }`}
            >
              Tabla B (Graves / 0 PG)
            </button>
          </div>
        </div>

        <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
          {selectedTable === 'A'
            ? 'Tabla A: Se activa tras un impacto único > 50% de PG o un golpe crítico que deje al personaje Malherido (< 50% PG).'
            : 'Tabla B: Se activa inmediatamente cuando el personaje cae a 0 PG o falla una salvación de muerte por 5 o más.'}
        </p>

        {/* Botones de Tirada: Digital o Físico en Mesa */}
        <div className="flex flex-col sm:flex-row gap-2 font-dnd-title">
          <button
            disabled={isRolling || readOnly}
            onClick={handleRollInjury}
            className="px-4 py-2 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover border border-dnd-gold text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Dices className="w-4 h-4 text-dnd-gold" />
            <span>Tirar 1d20 en Tabla {selectedTable}</span>
          </button>
          <button
            disabled={readOnly}
            onClick={() => setShowPhysicalEntry(!showPhysicalEntry)}
            className={`px-4 py-2 rounded-sm border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              showPhysicalEntry
                ? 'bg-dnd-gold-surface border-dnd-gold text-dnd-gold shadow-sm'
                : 'bg-dnd-parchment-contrast hover:bg-dnd-parchment border-dnd-border-antique text-dnd-ink'
            }`}
          >
            <Sparkles className="w-4 h-4 text-dnd-terracotta" />
            <span>Tiré en Mesa (1d20)</span>
          </button>
        </div>

        {/* Panel para ingresar d20 físico tirado en la mesa */}
        {showPhysicalEntry && !readOnly && (
          <div className="p-3.5 rounded-sm bg-dnd-parchment-dark border-2 border-dnd-gold space-y-2 animate-in fade-in shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-dnd-title font-bold text-dnd-crimson uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-dnd-gold" />
                Selecciona lo que sacaste en tu d20 físico en la mesa:
              </span>
              <span className="text-[10px] text-dnd-ink-muted font-dnd-title">
                1 al 20
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setInjuryRoll(num)}
                  className={`w-7 h-7 rounded-md text-xs font-dnd-title font-bold transition flex items-center justify-center ${
                    injuryRoll === num
                      ? 'bg-dnd-crimson text-white shadow-sm ring-1 ring-dnd-gold'
                      : 'bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink hover:border-dnd-gold'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resultado de la Tirada */}
        {injuryRoll !== null && currentRolledDef && (
          <div className="p-4 rounded-lg bg-dnd-parchment-contrast border border-dnd-crimson flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in shadow-md">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-md bg-dnd-crimson border border-dnd-gold flex items-center justify-center font-dnd-title font-black text-xl text-white shrink-0 shadow-sm">
                {injuryRoll}
              </div>
              <div className="space-y-1">
                <span className="font-dnd-title font-bold text-sm text-dnd-crimson block uppercase tracking-wide">
                  {currentRolledDef.name}
                </span>
                <p className="text-xs text-dnd-ink font-dnd-body leading-relaxed">
                  {currentRolledDef.description}
                </p>
                <span className="text-xs text-dnd-gold font-dnd-title block font-semibold">
                  Tratamiento: {currentRolledDef.durationOrTreatment}
                </span>
              </div>
            </div>

            {!readOnly && (
              <button
                onClick={handleApplyRolledInjury}
                className="px-3.5 py-1.5 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover border border-dnd-gold text-xs font-dnd-title font-bold uppercase tracking-wider text-white shrink-0 transition shadow-sm"
              >
                Aplicar a mi Ficha
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Inyector Rápido de Condiciones Estándar de D&D (15 Condiciones) */}
      <div className="p-5 rounded-lg bg-dnd-parchment text-dnd-ink border border-dnd-border-antique dnd-notched space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-dnd-gold" />
            <h4 className="font-dnd-title font-bold text-xs uppercase tracking-wider text-dnd-crimson">
              Glosario de Condiciones Estándar (Activar / Desactivar)
            </h4>
          </div>
          <span className="text-xs text-dnd-ink-muted font-dnd-title">1 clic para aplicar</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {STANDARD_CONDITIONS_LIST.map(cond => {
            const isActive = activeEffects.some(
              e => e.type === 'condition' && (e.conditionId === cond.id || e.name.toLowerCase() === cond.name.toLowerCase())
            );

            return (
              <button
                key={cond.id}
                type="button"
                disabled={readOnly}
                onClick={() => handleToggleCondition(cond)}
                className={`p-2.5 rounded-md border text-left transition flex flex-col justify-between space-y-1 ${
                  isActive
                    ? 'bg-dnd-crimson border-dnd-gold text-white shadow-sm'
                    : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink hover:border-dnd-gold'
                }`}
                title={cond.description}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-dnd-title font-bold uppercase">{cond.name}</span>
                  {isActive && <span className="text-[10px] font-dnd-title font-bold text-dnd-gold">ACTIVO</span>}
                </div>
                <p className={`text-[10px] line-clamp-2 font-dnd-body ${isActive ? 'text-dnd-parchment/80' : 'text-dnd-ink-muted'}`}>
                  {cond.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Inyector Rápido de Buffs de la Compañía (Filtrado Contextual por Personaje y Rol DM) */}
      <div className="p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dnd-border-antique/80 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <h4 className="font-dnd-title font-bold text-xs uppercase tracking-wider text-dnd-crimson">
              {userRole === 'dm'
                ? `Inyección de Buffs de la Compañía (Vista DM · ${character.name})`
                : isViewingAlly
                ? `Soporte de ${viewerHeroName || 'tu personaje'} ➔ ${character.name}`
                : `Mejoras y Buffs Propios (${character.name})`}
            </h4>
          </div>
          <span className="text-[11px] text-dnd-ink-muted font-dnd-title">
            {userRole === 'dm'
              ? 'Catálogo completo de la compañía'
              : isViewingAlly
              ? 'Inyección de soporte táctico'
              : 'Auto-aplicación en combate'}
          </span>
        </div>

        <p className="text-xs text-dnd-ink-muted font-dnd-body">
          {userRole === 'dm'
            ? `Como Dungeon Master puedes inyectar buffs propios de ${character.name} o habilidades de soporte de los demás compañeros.`
            : isViewingAlly
            ? `Como ${viewerHeroName || 'compañero aliado'}, puedes otorgarle tus hechizos y habilidades de soporte a ${character.name} (haz clic para activar o retirar).`
            : `Selecciona una de tus habilidades o conjuros preparados para activarlo sobre ti mismo en combate.`}
        </p>

        <div className="flex items-center gap-2 flex-wrap pt-1 font-dnd-title">
          {availableBuffs.map(buff => {
            const isBuffActive = activeEffects.some(
              e => e.type === 'buff' && e.name.toLowerCase() === buff.name.toLowerCase()
            );

            // Los aliados y el DM pueden interactuar aunque la hoja general esté en readOnly
            const canClick = !readOnly || userRole === 'dm' || isViewingAlly;
            const isOwnBuff = buff.ownerSlug === character.slug;

            return (
              <button
                key={buff.id}
                type="button"
                disabled={!canClick}
                onClick={() => handleToggleBuff(buff)}
                className={`px-3 py-1.5 rounded-sm border text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-xs ${
                  isBuffActive
                    ? 'bg-emerald-700 border-emerald-500 text-white shadow-sm'
                    : 'bg-dnd-parchment-contrast hover:bg-dnd-parchment border-dnd-border-antique hover:border-emerald-600 text-dnd-ink hover:text-emerald-700 dark:hover:text-emerald-400'
                } ${!canClick ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={`${buff.name}: ${buff.description} (${buff.duration}) — Propietario: ${buff.ownerName}`}
              >
                {isBuffActive ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                )}
                <span>{buff.name}</span>

                {/* Badge de Propietario para DM */}
                {userRole === 'dm' && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-xs font-sans font-bold uppercase tracking-normal ${
                      isOwnBuff
                        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-600/30'
                        : 'bg-blue-500/20 text-blue-800 dark:text-blue-200 border border-blue-600/30'
                    }`}
                  >
                    {isOwnBuff ? `Propio · ${buff.ownerName}` : buff.ownerName}
                  </span>
                )}

                {/* Badge en Vista de Compañero */}
                {isViewingAlly && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-600/30 font-sans font-bold uppercase tracking-normal">
                    Tu soporte
                  </span>
                )}

                {isBuffActive && (
                  <span className="text-[9px] px-1 rounded-xs bg-white/25 text-white font-mono font-bold">
                    ACTIVO
                  </span>
                )}
              </button>
            );
          })}

          {availableBuffs.length === 0 && (
            <p className="text-xs text-dnd-ink-muted font-dnd-body italic">
              No hay buffs o habilidades de soporte disponibles para aplicar en este contexto.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
