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
  isSpellCantrip,
  getCanonicalSpellBySlugOrName,
  getEffectiveAbilityScore,
  getTacticalActions,
  type InventoryItem,
  type CanonicalSpellData
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

  const rolledActionRef = React.useRef<HTMLDivElement>(null);
  const [castFeedback, setCastFeedback] = useState<Record<string, string>>({});

  // Estado para tirada física de arma o ataque desarmado en mesa
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

  // Fuerza efectiva evaluando objetos con stat override (guanteletes de ogro, prótesis arcana, etc.)
  const effectiveStr = getEffectiveAbilityScore(character, 'str');
  const strMod = calculateAbilityModifier(effectiveStr);
  const dexMod = calculateAbilityModifier(dexScore);

  const grappleDc = calculateGrappleOrShoveDC(effectiveStr, pb);

  // Detección de clases y rasgos
  const classesNorm = [
    (character.character_class || '').toLowerCase(),
    ...(character.multiclass || []).map(m => `${m.class} ${m.subclass || ''}`.toLowerCase())
  ].join(' ');
  const isMonk = classesNorm.includes('monje');

  // Disponibilidad de acciones evaluada
  const availability = evaluatedState?.availability;
  const isActionBlocked = availability?.action && !availability.action.available;
  const isBonusActionBlocked = availability?.bonus_action && !availability.bonus_action.available;
  const isReactionBlocked = availability?.reaction && !availability.reaction.available;
  const isMartialArtsAvailable = isMonk && (availability?.martial_arts?.available !== false);

  // Acciones tácticas de clase, subclase y objetos mágicos derivadas de forma agnóstica
  const tacticalActions = getTacticalActions(character, availability);

  // Armas equipadas (estrictamente con equipped: true)
  const equippedWeapons = (character.inventory || []).filter(
    i => (i.category === 'weapon' || i.weapon !== undefined) && i.equipped
  );

  // Clasificación de conjuros preparados y trucos conocidos para la Economía de Acciones
  const rawPrepared = character.prepared_spells || [];
  const known = character.known_spells || [];
  const cantripNames = known.filter(isSpellCantrip);
  const activeSpellNames = Array.from(new Set([...rawPrepared, ...cantripNames]));

  const actionSpells: CanonicalSpellData[] = [];
  const bonusActionSpells: CanonicalSpellData[] = [];
  const reactionSpells: CanonicalSpellData[] = [];

  for (const name of activeSpellNames) {
    const sp = getCanonicalSpellBySlugOrName(name);
    if (!sp) {
      actionSpells.push({
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        level: isSpellCantrip(name) ? 0 : 1,
        school: 'Evocación',
        castingTime: '1 acción',
        actionType: 'action',
        range: '60 pies',
        components: { verbal: true, somatic: true, material: false },
        duration: 'Instantáneo',
        concentration: false,
        ritual: false,
        classes: [],
        effectSummary: 'Conjuro preparado para el combate.',
        description: 'Conjuro listo en memoria arcana.'
      });
      continue;
    }
    if (sp.actionType === 'bonus_action') {
      bonusActionSpells.push(sp);
    } else if (sp.actionType === 'reaction') {
      reactionSpells.push(sp);
    } else {
      actionSpells.push(sp);
    }
  }

  // Espacios de conjuro
  const spellSlots = character.spell_slots || {};

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

  // Lanzamiento de conjuro interactivo (Digital, En Mesa, Ritual) con deducción de ranuras
  const handleCastSpell = (
    sp: CanonicalSpellData,
    mode: 'digital' | 'table' | 'ritual'
  ) => {
    const isRitual = mode === 'ritual';
    const isCantrip = sp.level === 0;
    const pool = sp.level > 0 ? (spellSlots[String(sp.level)] || spellSlots[sp.level]) : undefined;

    if (!isRitual && !isCantrip) {
      if (!pool || pool.used >= pool.total) {
        setCastFeedback(prev => ({ ...prev, [sp.slug]: `⚠️ Sin espacios de Nv. ${sp.level}` }));
        setTimeout(() => {
          setCastFeedback(prev => {
            const next = { ...prev };
            delete next[sp.slug];
            return next;
          });
        }, 3000);
        return;
      }
      // Deducir automáticamente ranura de conjuro
      onUpdateSpellSlot?.(String(sp.level), pool.used + 1);
    }

    // Feedback visual en la tarjeta
    const feedbackText = isRitual
      ? '📖 ¡Lanzado como Ritual!'
      : isCantrip
        ? '✨ ¡Truco Lanzado!'
        : `✨ ¡Lanzado! (Ranura Nv.${sp.level} ${pool ? `${pool.used + 1}/${pool.total}` : ''})`;

    setCastFeedback(prev => ({ ...prev, [sp.slug]: feedbackText }));
    setTimeout(() => {
      setCastFeedback(prev => {
        const next = { ...prev };
        delete next[sp.slug];
        return next;
      });
    }, 3000);

    // Tirada digital vs mesa
    if (mode === 'table') {
      setRolledAction({
        title: `Conjuro en Mesa: ${sp.name}`,
        d20: 20,
        modifier: 0,
        total: 20,
        details: isRitual
          ? `Lanzado en la mesa como Ritual (10 min). Alcance: ${sp.range}. ${sp.effectSummary}`
          : isCantrip
            ? `Truco lanzado en la mesa. Alcance: ${sp.range}. ${sp.effectSummary}`
            : `Lanzado en la mesa. Espacio de Nv. ${sp.level} consumido (${pool ? `${pool.used + 1}/${pool.total}` : ''}). Alcance: ${sp.range}. ${sp.effectSummary}`,
        isPhysical: true
      });
    } else {
      // Modo digital
      const match = sp.effectSummary.match(/(\d+)d(\d+)/);
      if (match) {
        handleRollAttack(
          `Conjuro: ${sp.name}`,
          character.spell_attack_bonus || 7,
          match[0]
        );
      } else {
        setRolledAction({
          title: `Conjuro: ${sp.name}`,
          d20: 20,
          modifier: 0,
          total: 20,
          details: isRitual
            ? `Lanzado como Ritual (10 min). Alcance: ${sp.range}. ${sp.effectSummary}`
            : isCantrip
              ? `Truco lanzado. Alcance: ${sp.range}. ${sp.effectSummary}`
              : `Espacio Nv. ${sp.level} consumido (${pool ? `${pool.used + 1}/${pool.total}` : ''}). Alcance: ${sp.range}. ${sp.effectSummary}`,
          isPhysical: false
        });
      }
    }

    // Desplazar suavemente hacia el banner para que el usuario vea el resultado
    if (rolledActionRef.current) {
      rolledActionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const renderSpellCard = (sp: CanonicalSpellData) => {
    const isCantrip = sp.level === 0;
    const pool = sp.level > 0 ? (spellSlots[String(sp.level)] || spellSlots[sp.level]) : undefined;
    const hasSlots = isCantrip || Boolean(pool && pool.used < pool.total);
    const slotsRemaining = pool ? pool.total - pool.used : 0;
    const feedback = castFeedback[sp.slug];

    return (
      <div
        key={sp.slug}
        className="p-2.5 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique space-y-1.5 hover:border-dnd-gold transition text-xs min-w-0"
      >
        <div className="flex items-start justify-between gap-1.5">
          <div>
            <span className="font-dnd-title font-bold text-dnd-crimson leading-tight block break-words">
              {sp.name}
            </span>
            <span className="text-[10px] text-dnd-ink-muted font-dnd-body block">
              {sp.school} • {sp.range}
            </span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink font-dnd-title font-semibold shrink-0">
            {isCantrip ? 'Truco' : `Nv. ${sp.level}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] flex-wrap font-sans">
          <span className="text-dnd-ink-muted">{sp.castingTime}</span>
          {sp.concentration && (
            <span className="text-purple-700 dark:text-purple-400 font-bold">
              • Conc.
            </span>
          )}
          {sp.ritual && (
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              • Ritual
            </span>
          )}
          {sp.attackOrSave && (
            <span className="text-dnd-terracotta font-semibold">
              • {sp.attackOrSave}
            </span>
          )}
        </div>

        <p className="text-[10px] text-dnd-ink font-dnd-body leading-snug line-clamp-2 break-words">
          {sp.effectSummary}
        </p>

        {/* Feedback visual interactivo tras lanzamiento */}
        {feedback && (
          <div className="px-2 py-1 rounded-xs bg-emerald-800 text-emerald-100 font-dnd-title font-bold text-[10px] text-center animate-in fade-in shadow-xs">
            {feedback}
          </div>
        )}

        {!readOnly && (
          <div className="pt-1.5 border-t border-dnd-border-antique/50 space-y-1">
            {/* Opciones de Lanzamiento: Digital vs Mesa */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={!hasSlots}
                onClick={() => handleCastSpell(sp, 'digital')}
                className={`py-1 px-1.5 rounded-xs border text-[10px] font-dnd-title font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                  hasSlots
                    ? 'bg-dnd-parchment-contrast hover:bg-dnd-parchment border-dnd-border-antique hover:border-dnd-gold text-dnd-crimson shadow-xs'
                    : 'bg-dnd-parchment-contrast/50 border-dnd-border-antique/40 text-dnd-ink-muted/50 cursor-not-allowed'
                }`}
                title={hasSlots ? (isCantrip ? 'Lanzar truco digitalmente' : `Lanzar digital (-1 ranura Nv.${sp.level})`) : `Sin ranuras de Nivel ${sp.level}`}
              >
                <Sparkles className="w-2.5 h-2.5 text-dnd-gold" />
                <span>💻 Digital {!isCantrip && pool ? `(${slotsRemaining}/${pool.total})` : ''}</span>
              </button>

              <button
                type="button"
                disabled={!hasSlots}
                onClick={() => handleCastSpell(sp, 'table')}
                className={`py-1 px-1.5 rounded-xs border text-[10px] font-dnd-title font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                  hasSlots
                    ? 'bg-dnd-parchment-contrast hover:bg-dnd-parchment border-dnd-border-antique hover:border-dnd-gold text-dnd-ink shadow-xs'
                    : 'bg-dnd-parchment-contrast/50 border-dnd-border-antique/40 text-dnd-ink-muted/50 cursor-not-allowed'
                }`}
                title={hasSlots ? (isCantrip ? 'Lanzar truco en mesa' : `Lanzar en mesa (-1 ranura Nv.${sp.level})`) : `Sin ranuras de Nivel ${sp.level}`}
              >
                <span>🎲 En Mesa</span>
              </button>
            </div>

            {/* Opción Ritual adicional si el conjuro lo permite */}
            {sp.ritual && (
              <button
                type="button"
                onClick={() => handleCastSpell(sp, 'ritual')}
                className="w-full py-1 px-1.5 rounded-xs bg-amber-950/20 hover:bg-amber-950/30 border border-amber-700/40 hover:border-amber-600 text-amber-800 dark:text-amber-300 text-[10px] font-dnd-title font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition"
                title="Lanzar como Ritual (+10 minutos). No gasta ranura de conjuro."
              >
                <span>📖 Lanzar como Ritual (0 ranuras)</span>
              </button>
            )}

            {!hasSlots && !sp.ritual && (
              <span className="text-[9px] text-dnd-crimson font-dnd-body font-semibold block text-center">
                ⚠️ Sin ranuras de Nivel {sp.level} disponibles
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Indicador de Concentración y Avisos Tácticos del Estado Evaluado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Concentración Activa */}
        <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 border ${
              character.concentrating_on
                ? 'bg-dnd-crimson border-dnd-crimson-hover text-white animate-pulse shadow-sm'
                : 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted'
            }`}>
              <Sparkles className="w-5 h-5 text-dnd-gold" />
            </div>
            <div>
              <span className="text-[11px] font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider block">
                Concentración Arcana
              </span>
              <p className="text-sm font-dnd-title font-bold text-dnd-ink">
                {character.concentrating_on ? (
                  <span className="text-dnd-crimson">{character.concentrating_on}</span>
                ) : (
                  <span className="text-dnd-ink-muted font-dnd-body font-normal">Ningún conjuro activo</span>
                )}
              </p>
              {character.concentrating_on && (
                <span className="text-[10px] text-dnd-ink-muted font-dnd-body block mt-0.5">
                  CD al recibir daño: Mayor entre 10 o mitad del daño (máx 30)
                </span>
              )}
            </div>
          </div>

          {!readOnly && character.concentrating_on && (
            <button
              onClick={() => onToggleConcentration?.(null)}
              className="px-2.5 py-1.5 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-crimson-surface border border-dnd-border-antique hover:border-dnd-crimson text-dnd-ink-muted hover:text-dnd-crimson text-xs font-dnd-title font-bold uppercase tracking-wider transition"
              title="Romper concentración"
            >
              Terminar
            </button>
          )}
        </div>

        {/* Aptitud Mágica y CD de Salvación (con soporte multiclase) */}
        <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2 shadow-md">
          <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-1.5">
            <span className="text-[11px] font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider">
              Aptitudes Mágicas
            </span>
            <span className="text-[10px] font-dnd-title text-dnd-ink-muted">CD / Ataque de Conjuro</span>
          </div>

          {character.spellcasting_stats && character.spellcasting_stats.length > 0 ? (
            <div className="space-y-1.5">
              {character.spellcasting_stats.map((sp, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-dnd-parchment-dark p-2 rounded-sm border border-dnd-border-antique">
                  <span className="font-dnd-title font-bold text-dnd-crimson">{sp.source} ({sp.ability}):</span>
                  <div className="flex items-center gap-3 font-dnd-title">
                    <span className="text-dnd-crimson font-bold">CD {sp.save_dc ? sp.save_dc - exhaustion * 2 : '-'}</span>
                    <span className="text-dnd-gold font-bold">{sp.attack_bonus ? formatModifier(sp.attack_bonus - exhaustion * 2) : '-'} atk</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-dnd-ink-muted font-dnd-body">
              {character.spell_save_dc ? (
                <div className="flex items-center justify-between bg-dnd-parchment-dark p-2 rounded-sm border border-dnd-border-antique">
                  <span className="font-dnd-title font-semibold text-dnd-ink">Aptitud ({character.spellcasting_ability}):</span>
                  <span className="font-dnd-title text-dnd-crimson font-bold">CD {character.spell_save_dc - exhaustion * 2}</span>
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
        <div className="p-3.5 rounded-sm bg-dnd-parchment border-2 border-dnd-border-antique dnd-notched space-y-2 shadow-md">
          <div className="flex items-center gap-2 text-xs font-dnd-title font-bold text-dnd-crimson uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4 text-dnd-terracotta" />
            <span>Condiciones Tácticas y Avisos de Combate:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {evaluatedState.disadvantages.map((d, i) => (
              <span key={i} className="px-2.5 py-1 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-crimson font-dnd-body font-semibold block">
                ⚠️ {d}
              </span>
            ))}
            {evaluatedState.tacticalReminders.map((r, i) => (
              <span key={i} className="px-2.5 py-1 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique text-dnd-gold font-dnd-body block">
                🛡️ {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. Armas y Ataques Listos para Tirar */}
      <div className="p-4 sm:p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-dnd-gold" />
            <h3 className="font-dnd-title font-bold text-sm text-dnd-crimson tracking-wide uppercase">
              Armas Equipadas y Ataques de Combate
            </h3>
          </div>
          <span className="text-xs font-dnd-title text-dnd-ink-muted">
            Agarre / Empujón CD: <strong className="text-dnd-crimson">{grappleDc}</strong>
          </span>
        </div>

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
                className="p-3.5 rounded-sm bg-dnd-parchment-dark border-2 border-dnd-border-antique flex flex-col justify-between space-y-3 hover:border-dnd-gold transition shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-dnd-title font-bold text-sm text-dnd-crimson block uppercase tracking-wide">
                        {wpn.name}
                      </span>
                      <span className="text-[11px] text-dnd-ink-muted font-dnd-body block mt-0.5">
                        {isFinesse ? 'Sutil (Fuerza o Destreza)' : isRanged ? 'A distancia' : 'Cuerpo a cuerpo'}
                        {meta?.versatileDice ? ` · Versátil (${meta.versatileDice})` : ''}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-crimson font-dnd-title font-bold text-xs shrink-0">
                      {formatModifier(attackBonus - exhaustion * 2)} al impacto
                    </span>
                  </div>

                  {/* Desglose de Daño y Efectos de Impacto */}
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="text-dnd-ink font-dnd-title font-semibold">
                      Daño: <span className="text-dnd-crimson font-bold">{damageFormula}</span>
                      {meta?.extraDamage?.map((ex, i) => (
                        <span key={i} className="text-dnd-terracotta font-semibold ml-1">
                          + {ex.dice} {ex.type}
                        </span>
                      ))}
                    </div>
                    {meta?.onHitEffect && (
                      <p className="text-[11px] text-dnd-ink-muted font-dnd-body leading-tight">
                        ⚡ <strong className="text-dnd-ink font-semibold">Impacto:</strong> {meta.onHitEffect}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botones de Tirada: Digital o Físico en Mesa */}
                {!readOnly && (
                  <div className="space-y-2 pt-1 border-t border-dnd-border-antique/50">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleRollAttack(wpn.name, attackBonus, `${baseDice}+${dmgMod}`)}
                        className="py-1.5 px-2.5 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique hover:border-dnd-gold text-dnd-crimson text-xs font-dnd-title font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-xs"
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
                        className={`py-1.5 px-2.5 rounded-sm border text-xs font-dnd-title font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-xs ${
                          activePhysicalWeapon === wpn.name
                            ? 'bg-dnd-gold/20 border-dnd-gold text-dnd-gold shadow-sm'
                            : 'bg-dnd-parchment-contrast hover:bg-dnd-parchment border-dnd-border-antique text-dnd-ink'
                        }`}
                        title="Registrar tirada física de dados en la mesa"
                      >
                        <span>🎲 Tiré en Mesa</span>
                      </button>
                    </div>

                    {/* Panel Desplegable de Tirada Física en Mesa para esta arma */}
                    {activePhysicalWeapon === wpn.name && (
                      <div className="p-3 rounded-sm bg-dnd-parchment border-2 border-dnd-gold space-y-2.5 animate-in fade-in shadow-md">
                        <div className="flex items-center justify-between border-b border-dnd-border-antique pb-1">
                          <span className="text-[11px] font-dnd-title font-bold text-dnd-crimson uppercase tracking-wide flex items-center gap-1">
                            🎲 Tirada Física en Mesa: {wpn.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActivePhysicalWeapon(null)}
                            className="text-xs text-dnd-ink-muted hover:text-dnd-ink px-1 rounded"
                          >
                            ✕
                          </button>
                        </div>

                        {/* 1. Selector d20 para el Ataque */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] text-dnd-ink-muted font-dnd-body font-medium">
                              Dado de Impacto (1d20):
                            </label>
                            <span className="text-[11px] font-dnd-title font-bold text-dnd-gold">
                              d20: {physicalD20} {formatModifier(attackBonus - exhaustion * 2)} = <span className="text-dnd-crimson text-xs font-black">{physicalD20 + attackBonus - exhaustion * 2}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1 flex-wrap">
                            {[1, 5, 8, 10, 12, 15, 18, 19, 20].map(v => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => setPhysicalD20(v)}
                                className={`px-2 py-0.5 rounded text-xs font-dnd-title font-bold transition ${
                                  physicalD20 === v
                                    ? v === 20
                                      ? 'bg-dnd-gold text-white shadow-sm ring-1 ring-dnd-gold'
                                      : v === 1
                                        ? 'bg-dnd-crimson text-white shadow-sm ring-1 ring-dnd-crimson'
                                        : 'bg-dnd-crimson text-white shadow-sm'
                                    : 'bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink hover:border-dnd-gold'
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
                              className="w-12 px-1 py-0.5 rounded bg-dnd-parchment-contrast border border-dnd-border-antique text-center font-dnd-title text-xs font-bold text-dnd-crimson focus:outline-none focus:border-dnd-gold"
                            />
                          </div>
                        </div>

                        {/* 2. Daño Físico Obtenido en Mesa */}
                        <div className="space-y-1 pt-1 border-t border-dnd-border-antique">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] text-dnd-ink-muted font-dnd-body font-medium">
                              Daño obtenido en la mesa ({damageFormula}):
                            </label>
                            <span className="text-[10px] text-dnd-ink-muted font-dnd-title">Dados + Mod.</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={200}
                              placeholder="Total sacado ej: 11"
                              value={physicalDamage}
                              onChange={(e) => setPhysicalDamage(e.target.value)}
                              className="flex-1 px-2.5 py-1 rounded bg-dnd-parchment-contrast border border-dnd-border-antique text-xs font-dnd-title text-dnd-ink focus:outline-none focus:border-dnd-gold placeholder:text-dnd-ink-subtle"
                            />
                            <button
                              type="button"
                              onClick={() => handleRegisterPhysicalAttack(wpn.name, attackBonus, damageFormula, physicalD20, physicalDamage)}
                              className="px-3 py-1 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white font-dnd-title font-bold text-xs uppercase tracking-wider transition shadow-sm"
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

          {/* Tarjeta de Ataque Desarmado Dinámico (Reglas de Monje / Artes Marciales vs Estándar) */}
          {(() => {
            const unarmedAtkBonus = isMonk && isMartialArtsAvailable
              ? dexMod + pb
              : strMod + pb;
            const unarmedDamageFormula = isMonk && isMartialArtsAvailable
              ? `1d6${formatModifier(dexMod)} contundente`
              : `${Math.max(1, 1 + strMod)} contundente`;
            const unarmedTitle = isMonk && isMartialArtsAvailable
              ? 'Ataque Desarmado (Artes Marciales - Monje)'
              : isMonk
                ? 'Ataque Desarmado (Estándar)'
                : 'Ataque Desarmado';
            const unarmedSubtitle = isMonk && isMartialArtsAvailable
              ? 'Monje sin armadura · Usa Destreza · Golpe desarmado adicional como Acción Adicional'
              : isMonk
                ? '⚠️ Artes Marciales desactivadas por armadura equipada (usa Fuerza base)'
                : 'Ataque básico sin armas';

            return (
              <div className="p-3.5 rounded-sm bg-dnd-parchment-dark border-2 border-dnd-border-antique flex flex-col justify-between space-y-3 hover:border-dnd-gold transition shadow-xs">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-dnd-title font-bold text-sm text-dnd-crimson block uppercase tracking-wide">
                        {unarmedTitle}
                      </span>
                      <span className="text-[11px] text-dnd-ink-muted font-dnd-body block mt-0.5">
                        {unarmedSubtitle}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-crimson font-dnd-title font-bold text-xs shrink-0">
                      {formatModifier(unarmedAtkBonus - exhaustion * 2)} al impacto
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-xs">
                    <div className="text-dnd-ink font-dnd-title font-semibold">
                      Daño: <span className="text-dnd-crimson font-bold">{unarmedDamageFormula}</span>
                    </div>
                    {isMonk && isMartialArtsAvailable && (
                      <p className="text-[11px] text-dnd-ink-muted font-dnd-body leading-tight">
                        🥋 <strong className="text-dnd-ink font-semibold">Artes Marciales:</strong> Puedes asestar 1 golpe desarmado como Acción Adicional gratis, o 2 con Ráfaga de Golpes (1 Ki).
                      </p>
                    )}
                    {isMonk && !isMartialArtsAvailable && (
                      <p className="text-[11px] text-dnd-crimson font-dnd-body leading-tight">
                        🛡️ <strong className="font-semibold">Armadura Equipada:</strong> Desequipa la armadura en la Vista C para habilitar el dado 1d6 de Artes Marciales y el bono de +10 pies de velocidad.
                      </p>
                    )}
                  </div>
                </div>

                {!readOnly && (
                  <div className="space-y-2 pt-1 border-t border-dnd-border-antique/50">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleRollAttack(unarmedTitle, unarmedAtkBonus, isMonk && isMartialArtsAvailable ? `1d6+${dexMod}` : `${Math.max(1, 1 + strMod)}`)}
                        className="py-1.5 px-2.5 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique hover:border-dnd-gold text-dnd-crimson text-xs font-dnd-title font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-xs"
                        title="Tirar ataque desarmado digitalmente"
                      >
                        <Dices className="w-3.5 h-3.5 text-dnd-gold" />
                        <span>Tirar Digital</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (activePhysicalWeapon === unarmedTitle) {
                            setActivePhysicalWeapon(null);
                          } else {
                            setActivePhysicalWeapon(unarmedTitle);
                            setPhysicalD20(10);
                            setPhysicalDamage('');
                          }
                        }}
                        className={`py-1.5 px-2.5 rounded-sm border text-xs font-dnd-title font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-xs ${
                          activePhysicalWeapon === unarmedTitle
                            ? 'bg-dnd-gold/20 border-dnd-gold text-dnd-gold shadow-sm'
                            : 'bg-dnd-parchment-contrast hover:bg-dnd-parchment border-dnd-border-antique text-dnd-ink'
                        }`}
                        title="Registrar tirada física de ataque desarmado en la mesa"
                      >
                        <span>🎲 Tiré en Mesa</span>
                      </button>
                    </div>

                    {/* Panel Desplegable de Tirada Física en Mesa para Ataque Desarmado */}
                    {activePhysicalWeapon === unarmedTitle && (
                      <div className="p-3 rounded-sm bg-dnd-parchment border-2 border-dnd-gold space-y-2.5 animate-in fade-in shadow-md">
                        <div className="flex items-center justify-between border-b border-dnd-border-antique pb-1">
                          <span className="text-[11px] font-dnd-title font-bold text-dnd-crimson uppercase tracking-wide flex items-center gap-1">
                            🎲 Tirada Física en Mesa: {unarmedTitle}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActivePhysicalWeapon(null)}
                            className="text-xs text-dnd-ink-muted hover:text-dnd-ink px-1 rounded"
                          >
                            ✕
                          </button>
                        </div>

                        {/* 1. Selector d20 para el Ataque */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] text-dnd-ink-muted font-dnd-body font-medium">
                              Dado de Impacto (1d20):
                            </label>
                            <span className="text-[11px] font-dnd-title font-bold text-dnd-gold">
                              d20: {physicalD20} {formatModifier(unarmedAtkBonus - exhaustion * 2)} = <span className="text-dnd-crimson text-xs font-black">{physicalD20 + unarmedAtkBonus - exhaustion * 2}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1 flex-wrap">
                            {[1, 5, 8, 10, 12, 15, 18, 19, 20].map(v => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => setPhysicalD20(v)}
                                className={`px-2 py-0.5 rounded text-xs font-dnd-title font-bold transition ${
                                  physicalD20 === v
                                    ? v === 20
                                      ? 'bg-dnd-gold text-white shadow-sm ring-1 ring-dnd-gold'
                                      : v === 1
                                        ? 'bg-dnd-crimson text-white shadow-sm ring-1 ring-dnd-crimson'
                                        : 'bg-dnd-crimson text-white shadow-sm'
                                    : 'bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink hover:border-dnd-gold'
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
                              className="w-12 px-1 py-0.5 rounded bg-dnd-parchment-contrast border border-dnd-border-antique text-center font-dnd-title text-xs font-bold text-dnd-crimson focus:outline-none focus:border-dnd-gold"
                            />
                          </div>
                        </div>

                        {/* 2. Daño Físico Obtenido en Mesa */}
                        <div className="space-y-1 pt-1 border-t border-dnd-border-antique">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] text-dnd-ink-muted font-dnd-body font-medium">
                              Daño obtenido en la mesa ({unarmedDamageFormula}):
                            </label>
                            <span className="text-[10px] text-dnd-ink-muted font-dnd-title">Dados + Mod.</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={200}
                              placeholder="Total sacado ej: 5"
                              value={physicalDamage}
                              onChange={(e) => setPhysicalDamage(e.target.value)}
                              className="flex-1 px-2.5 py-1 rounded bg-dnd-parchment-contrast border border-dnd-border-antique text-xs font-dnd-title text-dnd-ink focus:outline-none focus:border-dnd-gold placeholder:text-dnd-ink-subtle"
                            />
                            <button
                              type="button"
                              onClick={() => handleRegisterPhysicalAttack(unarmedTitle, unarmedAtkBonus, unarmedDamageFormula, physicalD20, physicalDamage)}
                              className="px-3 py-1 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white font-dnd-title font-bold text-xs uppercase tracking-wider transition shadow-sm"
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
          })()}
        </div>

        {/* Modal / Banner de Resultado de Tirada en Vivo */}
        {rolledAction && (
          <div ref={rolledActionRef} className={`p-4 rounded-sm bg-dnd-parchment border-2 flex items-center justify-between gap-4 animate-in fade-in shadow-lg ${
            rolledAction.isCrit
              ? 'border-dnd-gold ring-1 ring-dnd-gold'
              : rolledAction.isFumble
                ? 'border-dnd-crimson ring-1 ring-dnd-crimson'
                : 'border-dnd-border-antique'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-sm flex items-center justify-center font-dnd-title font-black text-xl shrink-0 shadow-md ${
                rolledAction.isCrit
                  ? 'bg-dnd-gold text-white'
                  : rolledAction.isFumble
                    ? 'bg-dnd-crimson text-white'
                    : 'bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-crimson'
              }`}>
                {rolledAction.d20}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-dnd-title font-bold text-dnd-crimson uppercase tracking-wide">
                    {rolledAction.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-dnd-title font-bold uppercase tracking-wider ${
                    rolledAction.isPhysical
                      ? 'bg-dnd-gold-surface border border-dnd-gold text-dnd-gold'
                      : 'bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted'
                  }`}>
                    {rolledAction.isPhysical ? '🎲 En Mesa' : '💻 Digital'}
                  </span>
                  {rolledAction.isCrit && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-dnd-title font-bold bg-dnd-gold text-white">
                      ¡CRÍTICO!
                    </span>
                  )}
                  {rolledAction.isFumble && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-dnd-title font-bold bg-dnd-crimson text-white">
                      ¡PIFIA!
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-dnd-ink-muted font-dnd-title">
                  d{rolledAction.damageDice ? '20' : ''} ({rolledAction.d20}) {formatModifier(rolledAction.modifier)} = <strong className="text-dnd-crimson text-sm font-bold">{rolledAction.total}</strong> al resultado
                </div>

                {rolledAction.damageResult !== undefined && (
                  <span className="text-[11px] text-[#15803d] font-dnd-title font-bold block">
                    Daño ({rolledAction.damageDice}): <strong>+{rolledAction.damageResult}</strong> PG
                  </span>
                )}
                {rolledAction.details && (
                  <span className="text-[10px] text-dnd-gold font-dnd-body font-semibold block">
                    {rolledAction.details}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setRolledAction(null)}
              className="text-dnd-ink-muted hover:text-dnd-ink text-xs transition px-2 py-1 self-start sm:self-center font-dnd-title uppercase"
            >
              ✕ Cerrar
            </button>
          </div>
        )}

        {/* Tirador Táctico Rápido (Dados Libres para Bufos, Salvaciones o Reglas Caseras) */}
        {!readOnly && (
          <div className="p-3.5 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique space-y-3">
            <div className="flex items-center justify-between border-b border-dnd-border-antique/50 pb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-dnd-title font-bold uppercase text-dnd-crimson">
                <Dices className="w-4 h-4 text-dnd-gold" />
                <span>Tirador Táctico Libre (Mesa o Digital para Bufos / Reglas)</span>
              </div>
              <span className="text-[10px] text-dnd-ink-muted font-dnd-title">d4 · d6 · d8 · d10 · d12 · d20</span>
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
                    className={`px-2.5 py-1 rounded-md text-xs font-dnd-title font-bold transition ${
                      tacticalDieType === sides
                        ? 'bg-dnd-crimson text-white shadow-sm'
                        : 'bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink hover:border-dnd-gold'
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
                  className="flex-1 sm:w-44 px-2 py-1 rounded bg-dnd-parchment-contrast border border-dnd-border-antique text-xs text-dnd-ink placeholder:text-dnd-ink-subtle focus:outline-none focus:border-dnd-gold"
                />
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-dnd-ink-muted font-dnd-title">Mod:</span>
                  <input
                    type="number"
                    value={tacticalModifier}
                    onChange={(e) => setTacticalModifier(parseInt(e.target.value, 10) || 0)}
                    className="w-12 px-1.5 py-1 rounded bg-dnd-parchment-contrast border border-dnd-border-antique text-center font-dnd-title text-xs text-dnd-crimson focus:outline-none focus:border-dnd-gold"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción del tirador táctico */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dnd-border-antique/50">
              <button
                type="button"
                onClick={handleRollTacticalDigital}
                className="py-1.5 px-3 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique hover:border-dnd-gold text-dnd-crimson text-xs font-dnd-title font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Dices className="w-3.5 h-3.5 text-dnd-gold" />
                <span>Tirar 1d{tacticalDieType} Digital</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTacticalPhysicalEntry(!showTacticalPhysicalEntry)}
                className={`py-1.5 px-3 rounded-sm border text-xs font-dnd-title font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-xs ${
                  showTacticalPhysicalEntry
                    ? 'bg-dnd-gold/20 border-dnd-gold text-dnd-gold shadow-sm'
                    : 'bg-dnd-parchment-contrast hover:bg-dnd-parchment border-dnd-border-antique text-dnd-ink'
                }`}
              >
                <span>🎲 Tiré 1d{tacticalDieType} en Mesa</span>
              </button>
            </div>

            {/* Botonera de dados físicos tácticos */}
            {showTacticalPhysicalEntry && (
              <div className="p-2.5 rounded-sm bg-dnd-parchment border-2 border-dnd-gold space-y-1.5 animate-in fade-in shadow-md">
                <span className="text-[10px] font-dnd-title font-bold text-dnd-crimson uppercase tracking-wide block">
                  Selecciona el resultado de tu 1d{tacticalDieType} en mesa:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Array.from({ length: tacticalDieType }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleRegisterTacticalPhysical(num)}
                      className="w-8 h-8 rounded-md bg-dnd-parchment-contrast hover:bg-dnd-crimson hover:text-white border border-dnd-border-antique text-dnd-ink text-xs font-dnd-title font-bold transition flex items-center justify-center"
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
        <div className="p-4 sm:p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-dnd-gold" />
              <h3 className="font-dnd-title font-bold text-sm text-dnd-crimson tracking-wide uppercase">
                Ranuras de Conjuro en Combate
              </h3>
            </div>
            <span className="text-xs text-dnd-ink-muted font-dnd-title">Gastar / Recuperar con 1 clic</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(spellSlots).map(([lvl, pool]) => {
              const total = pool.total || 0;
              const used = pool.used || 0;
              const available = Math.max(0, total - used);

              return (
                <div
                  key={lvl}
                  className="p-3 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique space-y-2 text-center"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-dnd-title font-bold text-dnd-crimson uppercase">
                      Nivel {lvl}
                    </span>
                    <span className="font-dnd-title text-xs text-dnd-ink-muted font-bold">
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
                          className={`w-5 h-5 rounded-full border-2 transition flex items-center justify-center ${
                            isSlotUsed
                              ? 'bg-dnd-parchment-contrast border-dnd-border-antique text-dnd-ink-muted'
                              : 'bg-dnd-crimson border-dnd-crimson-hover text-white shadow-xs'
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

      {/* 4. Economía de Acciones Oficial (4 Secciones Reactivas: Principal, Adicional, Reacción, Interacción Entorno) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start w-full">
        {/* Columna 1: Acción Principal */}
        <div className={`p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 space-y-3 dnd-notched shadow-md transition ${
          isActionBlocked ? 'opacity-40 border-dnd-crimson' : 'border-dnd-border-antique'
        }`}>
          <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
            <span className="font-dnd-title font-bold text-xs uppercase tracking-wider text-dnd-crimson">
              Acción Principal
            </span>
            {isActionBlocked ? (
              <span className="text-[10px] text-dnd-crimson font-dnd-title font-bold flex items-center gap-0.5">
                <Lock className="w-3 h-3" /> Bloqueado
              </span>
            ) : (
              <span className="text-[10px] text-[#15803d] font-dnd-title font-bold">1 / turno</span>
            )}
          </div>

          {isActionBlocked && (
            <p className="text-[11px] text-dnd-crimson font-dnd-body font-semibold">
              Bloqueado por: {availability?.action.blockedBy.join(', ')}
            </p>
          )}

          <ul className="space-y-1.5 text-xs text-dnd-ink font-dnd-body">
            <li className="p-2 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique flex items-center justify-between">
              <span>Atacar con armas / Desarmado</span>
              <span className="text-[10px] text-dnd-ink-muted font-dnd-title font-semibold">1-2 ataques</span>
            </li>
            <li className="p-2 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique flex items-center justify-between">
              <span>Agarrar / Empujar</span>
              <span className="text-[10px] text-dnd-crimson font-dnd-title font-bold">CD {grappleDc}</span>
            </li>
            <li className="p-2 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique flex items-center justify-between">
              <span>Correr / Destrabarse</span>
              <span className="text-[10px] text-dnd-ink-muted font-dnd-title font-semibold">+Velocidad</span>
            </li>
            <li className="p-2 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique flex items-center justify-between">
              <span>Esquivar / Ayudar</span>
              <span className="text-[10px] text-dnd-ink-muted font-dnd-title font-semibold">Ventaja / Desv.</span>
            </li>
          </ul>

          {/* Subsección Reactiva: Conjuros de 1 Acción y Trucos Listos */}
          <div className="pt-2 border-t border-dnd-border-antique/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-dnd-title font-bold uppercase tracking-wider text-dnd-crimson">
                ✨ Conjuros de 1 Acción ({actionSpells.length})
              </span>
              <span className="text-[9px] text-dnd-ink-muted font-dnd-title">Listos</span>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {actionSpells.map(renderSpellCard)}
            </div>
          </div>
        </div>

        {/* Columna 2: Acción Adicional */}
        <div className={`p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 space-y-3 dnd-notched shadow-md transition ${
          isBonusActionBlocked ? 'opacity-40 border-dnd-crimson' : 'border-dnd-border-antique'
        }`}>
          <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
            <span className="font-dnd-title font-bold text-xs uppercase tracking-wider text-dnd-crimson">
              Acción Adicional
            </span>
            {isBonusActionBlocked ? (
              <span className="text-[10px] text-dnd-crimson font-dnd-title font-bold flex items-center gap-0.5">
                <Lock className="w-3 h-3" /> Bloqueado
              </span>
            ) : (
              <span className="text-[10px] text-dnd-gold font-dnd-title font-bold">1 / turno</span>
            )}
          </div>

          <ul className="space-y-1.5 text-xs text-dnd-ink font-dnd-body">
            <li className="p-2 rounded-sm bg-dnd-parchment-contrast border border-dnd-gold text-dnd-gold flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-dnd-title font-bold">
                <Wine className="w-3.5 h-3.5 text-dnd-gold" /> Beber Poción
              </span>
              <span className="text-[10px] text-dnd-gold font-dnd-title font-bold">Regla 5.5e</span>
            </li>

            {isMonk && !isMartialArtsAvailable && (
              <li className="p-2 rounded-sm bg-dnd-crimson-surface border border-dnd-crimson text-dnd-crimson">
                <span className="font-dnd-title font-bold block text-[11px]">
                  ⚠️ Artes Marciales Desactivadas
                </span>
                <span className="text-[10px]">
                  Llevar armadura o escudo desactiva el golpe adicional y Ráfaga.
                </span>
              </li>
            )}

            {tacticalActions.bonusActions.map(action => {
              const variantClass =
                action.highlightVariant === 'crimson'
                  ? 'text-dnd-crimson'
                  : action.highlightVariant === 'green'
                    ? 'text-[#15803d]'
                    : action.highlightVariant === 'gold'
                      ? 'text-dnd-gold'
                      : 'text-dnd-ink';

              return (
                <li
                  key={action.id}
                  className={`p-2 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique ${
                    action.available === false ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-dnd-title font-bold block ${variantClass}`}>
                      {action.name}
                    </span>
                    {action.cost && (
                      <span className="text-[10px] text-dnd-ink-muted font-mono">{action.cost}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-dnd-ink-muted">{action.description}</span>
                </li>
              );
            })}
          </ul>

          {/* Subsección Reactiva: Conjuros Rápidos Preparados */}
          {bonusActionSpells.length > 0 && (
            <div className="pt-2 border-t border-dnd-border-antique/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-dnd-title font-bold uppercase tracking-wider text-dnd-gold">
                  ⚡ Conjuros Rápidos ({bonusActionSpells.length})
                </span>
                <span className="text-[9px] text-dnd-ink-muted font-dnd-title">1 Acción Adicional</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {bonusActionSpells.map(renderSpellCard)}
              </div>
            </div>
          )}
        </div>

        {/* Columna 3: Reacción */}
        <div className={`p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 space-y-3 dnd-notched shadow-md transition ${
          isReactionBlocked ? 'opacity-40 border-dnd-crimson' : 'border-dnd-border-antique'
        }`}>
          <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
            <span className="font-dnd-title font-bold text-xs uppercase tracking-wider text-dnd-crimson">
              Reacción
            </span>
            {isReactionBlocked ? (
              <span className="text-[10px] text-dnd-crimson font-dnd-title font-bold flex items-center gap-0.5">
                <Lock className="w-3 h-3" /> Bloqueado
              </span>
            ) : (
              <span className="text-[10px] text-dnd-terracotta font-dnd-title font-bold">1 / ronda</span>
            )}
          </div>

          {isReactionBlocked && (
            <p className="text-[11px] text-dnd-crimson font-dnd-body font-semibold">
              Bloqueado por: {availability?.reaction.blockedBy.join(', ')}
            </p>
          )}

          <ul className="space-y-1.5 text-xs text-dnd-ink font-dnd-body">
            {tacticalActions.reactions.map(action => {
              const variantClass =
                action.highlightVariant === 'crimson'
                  ? 'text-dnd-crimson'
                  : action.highlightVariant === 'green'
                    ? 'text-[#15803d]'
                    : action.highlightVariant === 'gold'
                      ? 'text-dnd-gold'
                      : 'text-dnd-ink';

              return (
                <li
                  key={action.id}
                  className={`p-2 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique ${
                    action.available === false ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-dnd-title font-bold block ${variantClass}`}>
                      {action.name}
                    </span>
                    {action.cost && (
                      <span className="text-[10px] text-dnd-ink-muted font-mono">{action.cost}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-dnd-ink-muted">{action.description}</span>
                </li>
              );
            })}
          </ul>

          {/* Subsección Reactiva: Conjuros de Reacción Preparados */}
          {reactionSpells.length > 0 && (
            <div className="pt-2 border-t border-dnd-border-antique/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-dnd-title font-bold uppercase tracking-wider text-dnd-terracotta">
                  🛡️ Reacciones Mágicas ({reactionSpells.length})
                </span>
                <span className="text-[9px] text-dnd-ink-muted font-dnd-title">1 Reacción</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {reactionSpells.map(renderSpellCard)}
              </div>
            </div>
          )}
        </div>

        {/* Columna 4: Interacción con Objetos */}
        <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique space-y-3 dnd-notched shadow-md">
          <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
            <span className="font-dnd-title font-bold text-xs uppercase tracking-wider text-dnd-crimson">
              Interacción Entorno
            </span>
            <span className="text-[10px] text-dnd-ink-muted font-dnd-title font-semibold">1 libre / turno</span>
          </div>

          <ul className="space-y-1.5 text-xs text-dnd-ink font-dnd-body">
            <li className="p-2 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique">
              <span>Desenvainar o enfundar un arma</span>
            </li>
            <li className="p-2 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique">
              <span>Abrir o cerrar una puerta / compuerta</span>
            </li>
            <li className="p-2 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique">
              <span>Sacar un objeto de la mochila</span>
            </li>
            <li className="p-2 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique">
              <span>Recoger un objeto del suelo</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
