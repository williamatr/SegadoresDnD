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
  } | null>(null);

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

  // Tirador simple para el simulador
  const handleRollAttack = (weaponName: string, attackBonus: number, damageFormula?: string) => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + attackBonus - (exhaustion * 2);

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
      modifier: attackBonus - (exhaustion * 2),
      total,
      damageDice: damageFormula,
      damageResult: damageTotal
    });
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

                  {/* Botón de Tirada Rápida Interactiva */}
                  {!readOnly && (
                    <button
                      onClick={() => handleRollAttack(wpn.name, attackBonus, `${baseDice}+${dmgMod}`)}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-dnd-surface border border-slate-700 hover:border-dnd-gold text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <Dices className="w-3.5 h-3.5 text-dnd-gold" />
                      Tirar Ataque y Daño
                    </button>
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
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-dnd-gold/60 flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-dnd-surface border border-dnd-gold flex items-center justify-center font-fantasy font-extrabold text-base text-dnd-gold shadow-md">
                {rolledAction.d20}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block">
                  Tirada de {rolledAction.title}
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  d20 ({rolledAction.d20}) {formatModifier(rolledAction.modifier)} = <strong className="text-dnd-gold text-sm font-bold">{rolledAction.total}</strong> para impactar
                </span>
                {rolledAction.damageResult !== undefined && (
                  <span className="text-[11px] text-emerald-400 font-mono block">
                    Daño estimado ({rolledAction.damageDice}): <strong>{rolledAction.damageResult}</strong> PG
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setRolledAction(null)}
              className="text-slate-400 hover:text-slate-200 text-xs transition px-2 py-1"
            >
              ✕ Cerrar
            </button>
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
