import React, { useState } from 'react';
import {
  Swords,
  Shield,
  Zap,
  Sparkles,
  Flame,
  AlertOctagon,
  Clock,
  Dices,
  RefreshCw,
  Wine,
  ShieldAlert,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import type { BaseViewProps } from '../types.ts';
import {
  calculateAbilityModifier,
  formatModifier,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
  calculateGrappleOrShoveDC,
  calculateConcentrationDC,
  type InventoryItem
} from '@segadores/dnd-core';

export function CombatConsoleView({
  character,
  readOnly = false,
  evaluatedState,
  onUpdateSpellSlot,
  onToggleConcentration
}: BaseViewProps) {
  const [rolledAction, setRolledAction] = useState<{
    title: string;
    d20: number;
    modifier: number;
    total: number;
    damageDice?: string;
    damageResult?: number;
    details?: string;
    isPhysical?: boolean;
    isCrit?: boolean;
    isFumble?: boolean;
  } | null>(null);

  // Estado para tirada física de arma en mesa
  const [activePhysicalWeapon, setActivePhysicalWeapon] = useState<string | null>(null);
  const [physicalD20, setPhysicalD20] = useState<number>(10);
  const [physicalDamage, setPhysicalDamage] = useState<string>('');

  // Estado para tirador táctico libre (bufos, salvaciones, dados libres de mesa)
  const [tacticalDieType, setTacticalDieType] = useState<number>(20);
  const [tacticalModifier, setTacticalModifier] = useState<number>(0);
  const [tacticalDescription, setTacticalDescription] = useState<string>('');
  const [showTacticalPhysicalEntry, setShowTacticalPhysicalEntry] = useState<boolean>(false);

  const pb = character.proficiency_bonus || 3;
  const exhaustion = character.exhaustion || 0;
  const strScore = character.ability_scores.str ?? 10;
  const dexScore = character.ability_scores.dex ?? 10;

  // Si tiene guanteletes de ogro o prótesis, FUE efectiva es 19 o 20
  const effectiveStr = character.slug === 'eru' ? 20 : character.inventory.some(i => i.attuned && i.slug.includes('guanteletes')) ? 19 : strScore;
  const strMod = calculateAbilityModifier(effectiveStr);
  const dexMod = calculateAbilityModifier(dexScore);

  const grappleDc = calculateGrappleOrShoveDC(effectiveStr, pb);

  // Armas equipadas
  const equippedWeapons = character.inventory.filter(i => i.category === 'weapon' && i.equipped);

  // Espacios de conjuro
  const spellSlots = character.spell_slots || {};

  // Disponibilidad de acciones evaluada
  const availability = evaluatedState?.availability;
  const isActionBlocked = availability?.action && !availability.action.available;
  const isBonusActionBlocked = availability?.bonus_action && !availability.bonus_action.available;
  const isReactionBlocked = availability?.reaction && !availability.reaction.available;

  // Tirada de ataque digital
  const handleRollAttack = (weaponName: string, attackBonus: number, damageFormula?: string) => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const mod = attackBonus - (exhaustion * 2);
    const total = d20 + mod;

    let damageTotal: number | undefined = undefined;
    if (damageFormula) {
      // Simular dado básico ej: 1d8+5 -> random(1,8)+5
      const match = damageFormula.match(/(\d+)d(\d+)(?:\+(\d+))?/);
      if (match) {
        const count = parseInt(match[1], 10);
        const sides = parseInt(match[2], 10);
        const bonus = match[3] ? parseInt(match[3], 10) : 0;
        let sum = bonus;
        for (let i = 0; i < count; i++) {
          sum += Math.floor(Math.random() * sides) + 1;
        }
        damageTotal = sum;
      }
    }

    setRolledAction({
      title: weaponName,
      d20,
      modifier: mod,
      total,
      damageDice: damageFormula,
      damageResult: damageTotal,
      isPhysical: false,
      isCrit: d20 === 20,
      isFumble: d20 === 1,
      details: d20 === 20 ? '¡Impacto Crítico Natural Digital!' : d20 === 1 ? '¡Pifia Natural Digital!' : undefined
    });
  };

  // Registro de tirada física en mesa
  const handleRegisterPhysicalAttack = (
    weaponName: string,
    attackBonus: number,
    damageFormula: string,
    d20Val: number,
    damageVal: string
  ) => {
    const mod = attackBonus - (exhaustion * 2);
    const total = d20Val + mod;
    const parsedDamage = damageVal.trim() !== '' ? parseInt(damageVal, 10) : undefined;
    const isCrit = d20Val === 20;
    const isFumble = d20Val === 1;

    setRolledAction({
      title: weaponName,
      d20: d20Val,
      modifier: mod,
      total,
      damageDice: damageFormula,
      damageResult: parsedDamage,
      isPhysical: true,
      isCrit,
      isFumble,
      details: isCrit
        ? '¡Impacto Crítico Natural! (Duplica dados de daño en tu mesa)'
        : isFumble
          ? '¡Pifia / Fallo Crítico Natural!'
          : undefined
    });
    setActivePhysicalWeapon(null);
  };

  // Tiradas tácticas libres (Digital)
  const handleRollTacticalDigital = () => {
    const roll = Math.floor(Math.random() * tacticalDieType) + 1;
    const total = roll + tacticalModifier;
    setRolledAction({
      title: tacticalDescription.trim() || `Tirada 1d${tacticalDieType}`,
      d20: roll,
      modifier: tacticalModifier,
      total,
      isPhysical: false,
      isCrit: tacticalDieType === 20 && roll === 20,
      isFumble: tacticalDieType === 20 && roll === 1,
      details: tacticalDieType === 20 && roll === 20 ? '¡Crítico 20!' : tacticalDieType === 20 && roll === 1 ? '¡Pifia 1!' : undefined
    });
  };

  // Registro de tirada táctica libre en mesa (Físico)
  const handleRegisterTacticalPhysical = (rollVal: number) => {
    const total = rollVal + tacticalModifier;
    setRolledAction({
      title: tacticalDescription.trim() || `Tirada 1d${tacticalDieType} en Mesa`,
      d20: rollVal,
      modifier: tacticalModifier,
      total,
      isPhysical: true,
      isCrit: tacticalDieType === 20 && rollVal === 20,
      isFumble: tacticalDieType === 20 && rollVal === 1,
      details: tacticalDieType === 20 && rollVal === 20 ? '¡Crítico 20 en la mesa!' : tacticalDieType === 20 && rollVal === 1 ? '¡Pifia 1 en la mesa!' : undefined
    });
    setShowTacticalPhysicalEntry(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Indicador de Concentración y Avisos Tácticos del Estado Evaluado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Concentración Activa */}
        <div className="p-4 rounded-2xl bg-dnd-card border border-dnd-border flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              character.concentrating_on
                ? 'bg-purple-950/70 border border-purple-700/60 text-purple-300 animate-pulse'
                : 'bg-slate-900 border border-slate-800 text-slate-500'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Concentración Arcana
              </span>
              <p className="text-sm font-bold text-slate-200">
                {character.concentrating_on ? (
                  <span className="text-purple-300">{character.concentrating_on}</span>
                ) : (
                  <span className="text-slate-500">Ningún conjuro activo</span>
                )}
              </p>
              {character.concentrating_on && (
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  CD al recibir daño: Mayor entre 10 o mitad del daño (máx 30)
                </span>
              )}
            </div>
          </div>

          {!readOnly && character.concentrating_on && (
            <button
              onClick={() => onToggleConcentration?.(null)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950 border border-slate-700 hover:border-red-700 text-slate-300 hover:text-red-300 text-xs font-semibold transition"
              title="Romper concentración"
            >
              Terminar
            </button>
          )}
        </div>

        {/* Aptitud Mágica y CD de Salvación (con soporte multiclase) */}
        <div className="p-4 rounded-2xl bg-dnd-card border border-dnd-border space-y-2 shadow-md">
          <div className="flex items-center justify-between border-b border-dnd-border/60 pb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Aptitudes Mágicas
            </span>
            <span className="text-[10px] font-mono text-slate-500">CD / Ataque de Conjuro</span>
          </div>

          {character.spellcasting_stats && character.spellcasting_stats.length > 0 ? (
            <div className="space-y-1.5">
              {character.spellcasting_stats.map((sp, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{sp.source} ({sp.ability}):</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-dnd-gold font-bold">CD {sp.save_dc ? sp.save_dc - exhaustion * 2 : '-'}</span>
                    <span className="text-purple-300 font-bold">{sp.attack_bonus ? formatModifier(sp.attack_bonus - exhaustion * 2) : '-'} atk</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              {character.spell_save_dc ? (
                <div className="flex items-center justify-between">
                  <span>Aptitud ({character.spellcasting_ability}):</span>
                  <span className="font-mono text-dnd-gold font-bold">CD {character.spell_save_dc - exhaustion * 2}</span>
                </div>
              ) : (
                'Sin aptitud mágica formal de lanzador.'
              )}
            </div>
          )}
        </div>
      </div>

      {/* Avisos Tácticos del Evaluador de Estado (TASK-02 evaluateCharacterState) */}
      {evaluatedState && (evaluatedState.tacticalReminders.length > 0 || evaluatedState.disadvantages.length > 0) && (
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-900/50 space-y-2 shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Condiciones Tácticas y Avisos de Combate:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {evaluatedState.disadvantages.map((d, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 font-medium block">
                ⚠️ {d}
              </span>
            ))}
            {evaluatedState.tacticalReminders.map((r, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-950/30 border border-amber-800/30 text-amber-200 block">
                🛡️ {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. Armas y Ataques Listos para Tirar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-dnd-card border border-dnd-border space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-dnd-border/60 pb-2">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-dnd-gold" />
            <h3 className="font-fantasy font-bold text-sm text-slate-100 tracking-wide uppercase">
              Armas Equipadas y Ataques de Combate
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Agarre / Empujón CD: <strong className="text-dnd-gold font-mono">{grappleDc}</strong>
          </span>
        </div>

        {equippedWeapons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {equippedWeapons.map((wpn, idx) => {
              const meta = wpn.weapon;
              const isFinesse = meta?.finesse;
              const isRanged = meta?.ranged;
              const magicBonus = meta?.magicalBonus ?? 0;

              // Calcular modificador de ataque
              const abilityMod = isRanged ? dexMod : isFinesse ? Math.max(strMod, dexMod) : strMod;
              const attackBonus = abilityMod + pb + magicBonus;

              // Fórmula de daño
              const baseDice = meta?.damageDice || '1d6';
              const dmgMod = abilityMod + magicBonus;
              const damageFormula = `${baseDice}${formatModifier(dmgMod)} ${meta?.damageType || 'daño'}`;

              return (
                <div
                  key={wpn.slug || idx}
                  className="p-3.5 rounded-xl bg-dnd-surface border border-dnd-border flex flex-col justify-between space-y-3 hover:border-dnd-gold/60 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-fantasy font-bold text-sm text-slate-100 block">
                          {wpn.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {isFinesse ? 'Sutil (Fuerza o Destreza)' : isRanged ? 'A distancia' : 'Cuerpo a cuerpo'}
                          {meta?.versatileDice ? ` · Versátil (${meta.versatileDice})` : ''}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-700/50 text-dnd-gold-light font-mono font-bold text-xs shrink-0">
                        {formatModifier(attackBonus - exhaustion * 2)} al impacto
                      </span>
                    </div>

                    {/* Desglose de Daño y Efectos de Impacto */}
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="text-slate-300 font-mono font-semibold">
                        Daño: <span className="text-amber-300">{damageFormula}</span>
                        {meta?.extraDamage?.map((ex, i) => (
                          <span key={i} className="text-purple-300 font-semibold ml-1">
                            + {ex.dice} {ex.type}
                          </span>
                        ))}
                      </div>
                      {meta?.onHitEffect && (
                        <p className="text-[11px] text-slate-400 leading-tight">
                          ⚡ <strong className="text-slate-300">Impacto:</strong> {meta.onHitEffect}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botones de Tirada: Digital o Físico en Mesa */}
                  {!readOnly && (
                    <div className="space-y-2 pt-1 border-t border-dnd-border/40">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleRollAttack(wpn.name, attackBonus, `${baseDice}+${dmgMod}`)}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-dnd-gold text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                          title="Tirar ataque y daño digitalmente"
                        >
                          <Dices className="w-3.5 h-3.5 text-dnd-gold" />
                          <span>Tirar Digital</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (activePhysicalWeapon === wpn.name) {
                              setActivePhysicalWeapon(null);
                            } else {
                              setActivePhysicalWeapon(wpn.name);
                              setPhysicalD20(10);
                              setPhysicalDamage('');
                            }
                          }}
                          className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                            activePhysicalWeapon === wpn.name
                              ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500'
                              : 'bg-amber-950/30 hover:bg-amber-950/60 border-amber-800/40 text-amber-300'
                          }`}
                          title="Registrar tirada física de dados en la mesa"
                        >
                          <span>🎲 Tiré en Mesa</span>
                        </button>
                      </div>

                      {/* Panel Desplegable de Tirada Física en Mesa para esta arma */}
                      {activePhysicalWeapon === wpn.name && (
                        <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-600/60 space-y-2.5 animate-in fade-in">
                          <div className="flex items-center justify-between border-b border-amber-900/40 pb-1">
                            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1">
                              🎲 Tirada Física en Mesa: {wpn.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActivePhysicalWeapon(null)}
                              className="text-[10px] text-slate-400 hover:text-slate-200"
                            >
                              ✕
                            </button>
                          </div>

                          {/* 1. Selector d20 para el Ataque */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] text-slate-300 font-medium">
                                Dado de Impacto (1d20):
                              </label>
                              <span className="text-[11px] font-mono font-bold text-dnd-gold">
                                d20: {physicalD20} {formatModifier(attackBonus - exhaustion * 2)} = <span className="text-amber-300 text-xs font-extrabold">{physicalD20 + attackBonus - exhaustion * 2}</span>
                              </span>
                            </div>

                            {/* Botones de acceso rápido d20 */}
                            <div className="flex items-center gap-1 flex-wrap">
                              {[1, 5, 8, 10, 12, 15, 18, 19, 20].map(v => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => setPhysicalD20(v)}
                                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                                    physicalD20 === v
                                      ? v === 20
                                        ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                                        : v === 1
                                          ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400'
                                          : 'bg-dnd-gold text-slate-950 shadow-md'
                                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-amber-600'
                                  }`}
                                >
                                  {v === 20 ? '20 ⭐' : v === 1 ? '1 💀' : v}
                                </button>
                              ))}
                              <input
                                type="number"
                                min={1}
                                max={20}
                                value={physicalD20}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!isNaN(val)) setPhysicalD20(Math.min(20, Math.max(1, val)));
                                }}
                                className="w-12 px-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-center font-mono text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                                title="Ingresa valor exacto del d20 (1-20)"
                              />
                            </div>

                            {physicalD20 === 20 && (
                              <p className="text-[10px] text-amber-400 font-bold">
                                ✨ ¡Impacto Crítico Natural! Recuerda duplicar dados de daño en tu mesa.
                              </p>
                            )}
                            {physicalD20 === 1 && (
                              <p className="text-[10px] text-red-400 font-bold">
                                💀 ¡Pifia / Fallo Crítico Natural! El ataque falla automáticamente.
                              </p>
                            )}
                          </div>

                          {/* 2. Daño Físico Obtenido en Mesa */}
                          <div className="space-y-1 pt-1 border-t border-slate-800">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] text-slate-300 font-medium">
                                Daño obtenido en la mesa ({damageFormula}):
                              </label>
                              <span className="text-[10px] text-slate-400 font-mono">Dados + Mod.</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                max={200}
                                placeholder="Total sacado ej: 11"
                                value={physicalDamage}
                                onChange={(e) => setPhysicalDamage(e.target.value)}
                                className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                              />
                              <button
                                type="button"
                                onClick={() => handleRegisterPhysicalAttack(wpn.name, attackBonus, damageFormula, physicalD20, physicalDamage)}
                                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition shadow-md"
                              >
                                Registrar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 text-center">
            No hay armas equipadas en combate. Puedes equipar armas desde la <strong className="text-slate-200">Vista C (Inventario)</strong>.
          </div>
        )}

        {/* Modal / Banner de Resultado de Tirada en Vivo */}
        {rolledAction && (
          <div className={`p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border flex items-center justify-between gap-4 animate-in fade-in shadow-lg ${
            rolledAction.isCrit
              ? 'border-amber-400/80 ring-1 ring-amber-500/50'
              : rolledAction.isFumble
                ? 'border-red-600/80 ring-1 ring-red-500/50'
                : 'border-dnd-gold/60'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-fantasy font-extrabold text-lg shrink-0 shadow-md ${
                rolledAction.isCrit
                  ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
                  : rolledAction.isFumble
                    ? 'bg-red-950/80 border border-red-500 text-red-400'
                    : 'bg-dnd-surface border border-dnd-gold text-dnd-gold'
              }`}>
                {rolledAction.d20}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-100">
                    {rolledAction.title}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    rolledAction.isPhysical
                      ? 'bg-amber-950/70 border border-amber-700/60 text-amber-300'
                      : 'bg-slate-800 border border-slate-700 text-slate-300'
                  }`}>
                    {rolledAction.isPhysical ? '🎲 Tirado en Mesa' : '💻 Tirada Digital'}
                  </span>
                  {rolledAction.isCrit && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                      ¡CRÍTICO!
                    </span>
                  )}
                  {rolledAction.isFumble && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                      ¡PIFIA!
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-300 font-mono">
                  d{rolledAction.damageDice ? '20' : ''} ({rolledAction.d20}) {formatModifier(rolledAction.modifier)} = <strong className="text-dnd-gold text-sm font-bold">{rolledAction.total}</strong> al resultado
                </div>

                {rolledAction.damageResult !== undefined && (
                  <span className="text-[11px] text-emerald-400 font-mono block">
                    Daño ({rolledAction.damageDice}): <strong>{rolledAction.damageResult}</strong> PG
                  </span>
                )}
                {rolledAction.details && (
                  <span className="text-[10px] text-amber-300 block font-medium">
                    {rolledAction.details}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setRolledAction(null)}
              className="text-slate-400 hover:text-slate-200 text-xs transition px-2 py-1 self-start sm:self-center"
            >
              ✕ Cerrar
            </button>
          </div>
        )}

        {/* Tirador Táctico Rápido (Dados Libres para Bufos, Salvaciones o Reglas Caseras) */}
        {!readOnly && (
          <div className="p-3.5 rounded-xl bg-dnd-surface border border-dnd-border/80 space-y-3">
            <div className="flex items-center justify-between border-b border-dnd-border/50 pb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-fantasy font-bold uppercase text-slate-200">
                <Dices className="w-4 h-4 text-dnd-gold" />
                <span>Tirador Táctico Libre (Mesa o Digital para Bufos / Reglas)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">d4 · d6 · d8 · d10 · d12 · d20</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Selector de tipo de dado */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[4, 6, 8, 10, 12, 20].map(sides => (
                  <button
                    key={sides}
                    type="button"
                    onClick={() => {
                      setTacticalDieType(sides);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      tacticalDieType === sides
                        ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
                        : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-amber-600'
                    }`}
                  >
                    d{sides}
                  </button>
                ))}
              </div>

              {/* Modificador y Descripción opcional */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Motivo (ej: Guía 1d4, Salvación...)"
                  value={tacticalDescription}
                  onChange={(e) => setTacticalDescription(e.target.value)}
                  className="flex-1 sm:w-44 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-600"
                />
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-mono">Mod:</span>
                  <input
                    type="number"
                    value={tacticalModifier}
                    onChange={(e) => setTacticalModifier(parseInt(e.target.value, 10) || 0)}
                    className="w-12 px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-center font-mono text-xs text-amber-300"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción del tirador táctico */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={handleRollTacticalDigital}
                className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Dices className="w-3.5 h-3.5 text-dnd-gold" />
                <span>Tirar 1d{tacticalDieType} Digital</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTacticalPhysicalEntry(!showTacticalPhysicalEntry)}
                className={`py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  showTacticalPhysicalEntry
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500'
                    : 'bg-amber-950/30 hover:bg-amber-950/60 border-amber-800/40 text-amber-300'
                }`}
              >
                <span>🎲 Tiré 1d{tacticalDieType} en Mesa</span>
              </button>
            </div>

            {/* Botonera de dados físicos tácticos */}
            {showTacticalPhysicalEntry && (
              <div className="p-2.5 rounded-xl bg-slate-950/90 border border-amber-600/60 space-y-1.5 animate-in fade-in">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide block">
                  Selecciona el resultado de tu 1d{tacticalDieType} en mesa:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Array.from({ length: tacticalDieType }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleRegisterTacticalPhysical(num)}
                      className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-amber-600 hover:text-slate-950 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition flex items-center justify-center"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Ranuras de Conjuro Interactivas */}
      {Object.keys(spellSlots).length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-dnd-card border border-dnd-border space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-dnd-border/60 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="font-fantasy font-bold text-sm text-slate-100 tracking-wide uppercase">
                Ranuras de Conjuro en Combate
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Gastar / Recuperar con 1 clic</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(spellSlots).map(([lvl, pool]) => {
              const total = pool.total || 0;
              const used = pool.used || 0;
              const available = Math.max(0, total - used);

              return (
                <div
                  key={lvl}
                  className="p-3 rounded-xl bg-dnd-surface border border-dnd-border space-y-2 text-center"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-fantasy text-purple-300">
                      Nivel {lvl}
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-semibold">
                      {available} / {total}
                    </span>
                  </div>

                  {/* Círculos interactivos de ranura */}
                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    {Array.from({ length: total }).map((_, idx) => {
                      const isSlotUsed = idx < used;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={readOnly}
                          onClick={() => {
                            if (isSlotUsed) {
                              onUpdateSpellSlot?.(lvl, used - 1);
                            } else {
                              onUpdateSpellSlot?.(lvl, used + 1);
                            }
                          }}
                          className={`w-5 h-5 rounded-full border transition flex items-center justify-center ${
                            isSlotUsed
                              ? 'bg-slate-900 border-slate-700 text-slate-600'
                              : 'bg-purple-600 border-purple-400 text-white shadow-sm shadow-purple-900'
                          }`}
                          title={isSlotUsed ? `Recuperar ranura Nivel ${lvl}` : `Gastar ranura Nivel ${lvl}`}
                        >
                          {!isSlotUsed && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Economía de Acciones Oficial (4 Secciones: Principal, Adicional, Reacción, Objeto) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Columna 1: Acción Principal */}
        <div className={`p-4 rounded-2xl bg-dnd-card border space-y-3 transition ${
          isActionBlocked ? 'opacity-40 border-red-900' : 'border-dnd-border'
        }`}>
          <div className="flex items-center justify-between border-b border-dnd-border/60 pb-2">
            <span className="font-fantasy font-bold text-xs uppercase tracking-wider text-slate-200">
              Acción Principal
            </span>
            {isActionBlocked ? (
              <span className="text-[10px] text-red-400 font-bold flex items-center gap-0.5">
                <Lock className="w-3 h-3" /> Bloqueado
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-mono">1 / turno</span>
            )}
          </div>

          {isActionBlocked && (
            <p className="text-[11px] text-red-300 font-medium">
              Bloqueado por: {availability?.action.blockedBy.join(', ')}
            </p>
          )}

          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="p-1.5 rounded bg-dnd-surface border border-slate-800 flex items-center justify-between">
              <span>Atacar con armas</span>
              <span className="text-[10px] text-slate-500 font-mono">Cuerpo a c. / Dist.</span>
            </li>
            <li className="p-1.5 rounded bg-dnd-surface border border-slate-800 flex items-center justify-between">
              <span>Lanzar un conjuro</span>
              <span className="text-[10px] text-purple-400 font-mono">1 acción</span>
            </li>
            <li className="p-1.5 rounded bg-dnd-surface border border-slate-800 flex items-center justify-between">
              <span>Correr / Destrabarse</span>
              <span className="text-[10px] text-slate-500 font-mono">+Velocidad</span>
            </li>
            <li className="p-1.5 rounded bg-dnd-surface border border-slate-800 flex items-center justify-between">
              <span>Esquivar / Ayudar</span>
              <span className="text-[10px] text-slate-500 font-mono">Ventaja / Desv.</span>
            </li>
            <li className="p-1.5 rounded bg-dnd-surface border border-slate-800 flex items-center justify-between">
              <span>Agarrar / Empujar</span>
              <span className="text-[10px] text-dnd-gold font-mono">CD {grappleDc}</span>
            </li>
          </ul>
        </div>

        {/* Columna 2: Acción Adicional */}
        <div className={`p-4 rounded-2xl bg-dnd-card border space-y-3 transition ${
          isBonusActionBlocked ? 'opacity-40 border-red-900' : 'border-dnd-border'
        }`}>
          <div className="flex items-center justify-between border-b border-dnd-border/60 pb-2">
            <span className="font-fantasy font-bold text-xs uppercase tracking-wider text-slate-200">
              Acción Adicional
            </span>
            {isBonusActionBlocked ? (
              <span className="text-[10px] text-red-400 font-bold flex items-center gap-0.5">
                <Lock className="w-3 h-3" /> Bloqueado
              </span>
            ) : (
              <span className="text-[10px] text-amber-400 font-mono">1 / turno</span>
            )}
          </div>

          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="p-1.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wine className="w-3 h-3 text-amber-400" /> Beber Poción
              </span>
              <span className="text-[10px] text-amber-400 font-mono">Regla 5.5e</span>
            </li>
            {character.slug === 'eru' && (
              <li className="p-1.5 rounded bg-dnd-surface border border-slate-800">
                <span className="font-semibold block">Nuevas Energías (Second Wind)</span>
                <span className="text-[10px] text-slate-400">Recupera 1d10+7 PG</span>
              </li>
            )}
            {character.slug === 'zuma' && (
              <>
                <li className="p-1.5 rounded bg-dnd-surface border border-slate-800">
                  <span className="font-semibold block">Acción Astuta (Pícaro)</span>
                  <span className="text-[10px] text-slate-400">Correr, Destrabarse o Esconderse</span>
                </li>
                <li className="p-1.5 rounded bg-dnd-surface border border-slate-800">
                  <span className="font-semibold block">Inspiración Bárdica</span>
                  <span className="text-[10px] text-slate-400">Dar 1d6 a un aliado a 60 pies</span>
                </li>
              </>
            )}
            {character.slug === 'solaria' && (
              <li className="p-1.5 rounded bg-dnd-surface border border-slate-800">
                <span className="font-semibold block">Entidad Simbiótica</span>
                <span className="text-[10px] text-slate-400">+28 PG temp, 2d6 esporas</span>
              </li>
            )}
            {character.slug === 'honiel' && (
              <li className="p-1.5 rounded bg-dnd-surface border border-slate-800">
                <span className="font-semibold block">Artes Marciales (Monje)</span>
                <span className="text-[10px] text-slate-400">Golpe desarmado como acción adicional</span>
              </li>
            )}
            <li className="p-1.5 rounded bg-dnd-surface border border-slate-800 flex items-center justify-between">
              <span>Conjuros rápidos</span>
              <span className="text-[10px] text-purple-400 font-mono">Palabra de curación</span>
            </li>
          </ul>
        </div>

        {/* Columna 3: Reacción */}
        <div className={`p-4 rounded-2xl bg-dnd-card border space-y-3 transition ${
          isReactionBlocked ? 'opacity-40 border-red-900' : 'border-dnd-border'
        }`}>
          <div className="flex items-center justify-between border-b border-dnd-border/60 pb-2">
            <span className="font-fantasy font-bold text-xs uppercase tracking-wider text-slate-200">
              Reacción
            </span>
            {isReactionBlocked ? (
              <span className="text-[10px] text-red-400 font-bold flex items-center gap-0.5">
                <Lock className="w-3 h-3" /> Bloqueado
              </span>
            ) : (
              <span className="text-[10px] text-cyan-400 font-mono">1 / ronda</span>
            )}
          </div>

          {isReactionBlocked && (
            <p className="text-[11px] text-red-300 font-medium">
              Bloqueado por: {availability?.reaction.blockedBy.join(', ')}
            </p>
          )}

          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="p-1.5 rounded bg-dnd-surface border border-slate-800 flex items-center justify-between">
              <span>Ataque de Oportunidad</span>
              <span className="text-[10px] text-slate-500 font-mono">Al salir de rango</span>
            </li>
            {character.slug === 'alizar' && (
              <li className="p-1.5 rounded bg-dnd-surface border border-slate-800">
                <span className="font-semibold block text-amber-300">Destello de Genialidad</span>
                <span className="text-[10px] text-slate-400">+4 a tirada de aliado a 30 pies</span>
              </li>
            )}
            {character.slug === 'solaria' && (
              <li className="p-1.5 rounded bg-dnd-surface border border-slate-800">
                <span className="font-semibold block text-emerald-300">Halo de Esporas</span>
                <span className="text-[10px] text-slate-400">1d6 / 2d6 necrótico a criatura a 10 pies</span>
              </li>
            )}
            {(character.slug === 'zuma' || character.slug === 'eru') && (
              <li className="p-1.5 rounded bg-dnd-surface border border-slate-800">
                <span className="font-semibold block">Esquiva Asombrosa</span>
                <span className="text-[10px] text-slate-400">Mitad de daño de un ataque visible</span>
              </li>
            )}
          </ul>
        </div>

        {/* Columna 4: Interacción con Objetos */}
        <div className="p-4 rounded-2xl bg-dnd-card border border-dnd-border space-y-3">
          <div className="flex items-center justify-between border-b border-dnd-border/60 pb-2">
            <span className="font-fantasy font-bold text-xs uppercase tracking-wider text-slate-200">
              Interacción Entorno
            </span>
            <span className="text-[10px] text-slate-400 font-mono">1 libre / turno</span>
          </div>

          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="p-1.5 rounded bg-dnd-surface border border-slate-800">
              <span>Desenvainar o enfundar un arma</span>
            </li>
            <li className="p-1.5 rounded bg-dnd-surface border border-slate-800">
              <span>Abrir o cerrar una puerta / compuerta</span>
            </li>
            <li className="p-1.5 rounded bg-dnd-surface border border-slate-800">
              <span>Sacar un objeto de la mochila</span>
            </li>
            <li className="p-1.5 rounded bg-dnd-surface border border-slate-800">
              <span>Recoger un objeto del suelo</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
