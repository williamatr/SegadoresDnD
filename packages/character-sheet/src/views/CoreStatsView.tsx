import React from 'react';
import {
  Shield,
  Zap,
  Footprints,
  Eye,
  Star,
  Check,
  Sparkles,
  Award,
  Flame,
  Swords
} from 'lucide-react';
import { HeraldicShield, TaperedRule, DndBadge } from '@segadores/ui';
import type { BaseViewProps } from '../types.ts';
import {
  calculateAbilityModifier,
  formatModifier,
  calculateSkillOrSaveBonus,
  getCharacterXpProgress,
  type AbilityKey,
  type AbilityCodeEs,
  type ProficiencyLevel
} from '@segadores/dnd-core';
import { HpTracker } from '../components/HpTracker.tsx';
import { DeathSavesTracker } from '../components/DeathSavesTracker.tsx';
import { HitDiceTracker } from '../components/HitDiceTracker.tsx';
import { ExhaustionSelector } from '../components/ExhaustionSelector.tsx';
import { ClassResourcesTracker } from '../components/ClassResourcesTracker.tsx';

const ABILITIES_CONFIG: Array<{ key: AbilityKey; code: AbilityCodeEs; name: string }> = [
  { key: 'str', code: 'FUE', name: 'Fuerza' },
  { key: 'dex', code: 'DES', name: 'Destreza' },
  { key: 'con', code: 'CON', name: 'Constitución' },
  { key: 'int', code: 'INT', name: 'Inteligencia' },
  { key: 'wis', code: 'SAB', name: 'Sabiduría' },
  { key: 'cha', code: 'CAR', name: 'Carisma' }
];

const STANDARD_SKILLS: Array<{ name: string; ability: AbilityCodeEs; abilityKey: AbilityKey }> = [
  { name: 'Acrobacias', ability: 'DES', abilityKey: 'dex' },
  { name: 'Atletismo', ability: 'FUE', abilityKey: 'str' },
  { name: 'Conocimiento Arcano', ability: 'INT', abilityKey: 'int' },
  { name: 'Engaño', ability: 'CAR', abilityKey: 'cha' },
  { name: 'Historia', ability: 'INT', abilityKey: 'int' },
  { name: 'Interpretación', ability: 'CAR', abilityKey: 'cha' },
  { name: 'Intimidación', ability: 'CAR', abilityKey: 'cha' },
  { name: 'Investigación', ability: 'INT', abilityKey: 'int' },
  { name: 'Juego de Manos', ability: 'DES', abilityKey: 'dex' },
  { name: 'Medicina', ability: 'SAB', abilityKey: 'wis' },
  { name: 'Naturaleza', ability: 'INT', abilityKey: 'int' },
  { name: 'Percepción', ability: 'SAB', abilityKey: 'wis' },
  { name: 'Perspicacia', ability: 'SAB', abilityKey: 'wis' },
  { name: 'Persuasión', ability: 'CAR', abilityKey: 'cha' },
  { name: 'Religión', ability: 'INT', abilityKey: 'int' },
  { name: 'Sigilo', ability: 'DES', abilityKey: 'dex' },
  { name: 'Supervivencia', ability: 'SAB', abilityKey: 'wis' },
  { name: 'Trato con Animales', ability: 'SAB', abilityKey: 'wis' }
];

export function CoreStatsView({
  character,
  readOnly = false,
  evaluatedState,
  onUpdateHp,
  onUpdateDeathSaves,
  onUpdateHitDice,
  onUpdateExhaustion,
  onUpdateResource,
  onShortRest,
  onLongRest,
  onTriggerInjuryTable,
  onOpenLevelUp,
  onLevelUp
}: BaseViewProps) {
  const exhaustion = character.exhaustion || 0;
  const pb = character.proficiency_bonus || 3;

  // Modificadores efectivos considerando el estado evaluado
  const effectiveAc = evaluatedState?.effectiveAc ?? character.armor_class;
  const effectiveSpeed = evaluatedState?.effectiveSpeed ?? Math.max(0, character.speed - exhaustion * 5);
  const xpProgress = getCharacterXpProgress(character.level, character.experience_points || 0);

  return (
    <div className="space-y-6">
      {/* 0. Barra de Progreso de Nivel y Experiencia (XP) - Pergamino y Oro */}
      <div className="p-4 sm:p-5 rounded-lg bg-dnd-parchment text-dnd-ink border border-dnd-border-antique dnd-notched shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-dnd-parchment-contrast border border-dnd-border-antique flex items-center justify-center text-dnd-crimson shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-dnd-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-dnd-title font-black text-base text-dnd-crimson uppercase tracking-wide">
                  Nivel {xpProgress.currentLevel}
                </span>
                {character.multiclass && character.multiclass.length > 0 && (
                  <span className="text-xs text-dnd-terracotta font-dnd-title font-bold">
                    ({character.multiclass.map(m => `${m.class} ${m.level}`).join(' / ')})
                  </span>
                )}
              </div>
              <p className="text-xs text-dnd-ink-muted font-dnd-body">
                {xpProgress.isMaxLevel ? (
                  <span className="text-dnd-gold font-bold">¡Nivel Épico Máximo alcanzado (Nivel 20)!</span>
                ) : (
                  <>
                    Próximo objetivo: <strong className="text-dnd-ink">Nivel {xpProgress.nextLevel}</strong> ({xpProgress.nextLevelThreshold.toLocaleString()} PX acumulados)
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <div className="text-left sm:text-right">
              <div className="flex items-baseline sm:justify-end gap-1.5">
                <span
                  className="text-xl sm:text-2xl font-dnd-title font-black text-dnd-crimson"
                  title={`Puntos de Experiencia disponibles: ${xpProgress.currentAvailableXp.toLocaleString()} PX`}
                >
                  {xpProgress.currentAvailableXp.toLocaleString()}
                </span>
                <span className="text-xs font-dnd-body text-dnd-ink-muted">
                  / {xpProgress.isMaxLevel ? 'MAX' : `${xpProgress.xpNeededForNextLevel.toLocaleString()} PX del nivel`}
                </span>
              </div>
              {!xpProgress.isMaxLevel && (
                <div className="space-y-0.5">
                  <span className="text-xs text-dnd-terracotta font-dnd-body font-semibold block">
                    {xpProgress.remainingXp === 0 ? (
                      <span className="text-emerald-700 font-bold">¡PX suficientes para subir a Nivel {xpProgress.nextLevel}!</span>
                    ) : (
                      `Faltan ${xpProgress.remainingXp.toLocaleString()} PX para Nivel ${xpProgress.nextLevel}`
                    )}
                  </span>
                  <span className="text-[11px] text-dnd-ink-muted font-dnd-body block">
                    ({xpProgress.totalAccumulatedXp.toLocaleString()} / {xpProgress.nextLevelThreshold.toLocaleString()} PX acumulados totales)
                  </span>
                </div>
              )}
            </div>

            {!readOnly && onOpenLevelUp && !xpProgress.isMaxLevel && (
              <button
                type="button"
                onClick={onOpenLevelUp}
                className="px-3 py-1.5 rounded-md bg-gradient-to-r from-dnd-terracotta to-dnd-gold hover:from-[#a34712] hover:to-[#a88225] text-white font-dnd-title font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-dnd-gold transition active:scale-95 self-start sm:self-end"
                title="Abrir motor interactivo de subida de nivel y multiclase al 50%"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Subir de Nivel</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra Visual de Progreso */}
        <div className="space-y-1">
          <div className="w-full h-3 rounded-full bg-dnd-parchment-contrast border border-dnd-border-antique overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-dnd-terracotta via-dnd-gold to-dnd-gold-light transition-all duration-500 rounded-full"
              style={{ width: `${xpProgress.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-dnd-ink-muted font-dnd-body">
            <span>Umbral Nv. {xpProgress.currentLevel}: {xpProgress.currentLevelThreshold.toLocaleString()} PX</span>
            <span className="font-bold text-dnd-crimson">{xpProgress.progressPercent}% completado</span>
            <span>Objetivo Nv. {xpProgress.nextLevel}: {xpProgress.nextLevelThreshold.toLocaleString()} PX</span>
          </div>
        </div>
      </div>

      {/* 1. Métricas Defensivas y de Combate Principales (Escudo Heráldico CA, Velocidad, Iniciativa, Percepción) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-stretch">
        {/* Clase de Armadura (Icono heráldico D&D 5e sin números duplicados) */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-dnd-parchment border border-dnd-border-antique text-dnd-ink dnd-notched flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-0.5">
            <span className="text-xs font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider block">
              Clase Armadura
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-dnd-title font-black text-dnd-crimson">
                {effectiveAc}
              </span>
              <span className="text-xs text-dnd-ink-muted uppercase font-dnd-title font-semibold">CA</span>
            </div>
            {evaluatedState && evaluatedState.acBreakdown.length > 0 && (
              <span className="text-xs text-dnd-ink-muted block truncate max-w-[120px] font-dnd-body" title={evaluatedState.acBreakdown.join(', ')}>
                {evaluatedState.acBreakdown[0]}
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-md bg-dnd-parchment-contrast border border-dnd-border-antique flex items-center justify-center text-dnd-crimson shrink-0">
            <Shield className="w-5 h-5 text-dnd-gold" />
          </div>
        </div>

        {/* Velocidad */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-dnd-parchment border border-dnd-border-antique text-dnd-ink dnd-notched flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-xs font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider block">
              Velocidad
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-dnd-title font-black text-dnd-ink">
                {effectiveSpeed}
              </span>
              <span className="text-xs text-dnd-ink-muted font-dnd-body">pies</span>
            </div>
            {exhaustion > 0 && (
              <span className="text-xs text-dnd-crimson font-bold block">
                -{exhaustion * 5} pies por fatiga
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-md bg-dnd-parchment-contrast border border-dnd-border-antique flex items-center justify-center text-dnd-crimson shrink-0">
            <Footprints className="w-5 h-5" />
          </div>
        </div>

        {/* Iniciativa */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-dnd-parchment border border-dnd-border-antique text-dnd-ink dnd-notched flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-xs font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider block">
              Iniciativa
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-dnd-title font-black text-dnd-ink">
                {formatModifier(character.initiative_modifier)}
              </span>
            </div>
            <span className="text-xs text-dnd-ink-muted block font-dnd-body">DES base</span>
          </div>
          <div className="w-10 h-10 rounded-md bg-dnd-parchment-contrast border border-dnd-border-antique flex items-center justify-center text-dnd-terracotta shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Percepción Pasiva */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-dnd-parchment border border-dnd-border-antique text-dnd-ink dnd-notched flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-xs font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider block">
              Percepción Pas.
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-dnd-title font-black text-dnd-ink">
                {character.passive_perception}
              </span>
              <span className="text-xs text-dnd-ink-muted font-dnd-body">SAB</span>
            </div>
            <span className="text-xs text-dnd-ink-muted block font-dnd-body">10 + SAB + PB</span>
          </div>
          <div className="w-10 h-10 rounded-md bg-dnd-parchment-contrast border border-dnd-border-antique flex items-center justify-center text-dnd-gold shrink-0">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Puntos de Golpe, Salvaciones de Muerte y Dados de Golpe */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          <HpTracker
            character={character}
            onUpdateHp={onUpdateHp}
            onTriggerInjuryTable={onTriggerInjuryTable}
            readOnly={readOnly}
          />
        </div>
        <div className="space-y-4">
          <DeathSavesTracker
            deathSaves={character.death_saves}
            onUpdateDeathSaves={onUpdateDeathSaves}
            readOnly={readOnly}
          />
          <HitDiceTracker
            hitDiceTotal={character.hit_dice_total}
            hitDiceCurrent={character.hit_dice_current}
            totalLevel={character.level}
            conModifier={calculateAbilityModifier(character.ability_scores.con ?? 10)}
            currentHp={character.current_hp}
            maxHp={character.max_hp}
            tempHp={character.temp_hp}
            onUpdateHp={onUpdateHp}
            onUpdateHitDice={onUpdateHitDice}
            onShortRest={onShortRest}
            onLongRest={onLongRest}
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* 3. Atributos Nucleares (FUE, DES, CON, INT, SAB, CAR) - Cajas Notched D&D 5e */}
      <div className="p-4 sm:p-5 rounded-lg bg-dnd-parchment text-dnd-ink border border-dnd-border-antique dnd-notched space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-dnd-gold" />
            <h3 className="font-dnd-title font-bold text-sm text-dnd-crimson tracking-wide uppercase">
              Puntuaciones de Característica y Salvaciones
            </h3>
          </div>
          <span className="text-xs font-dnd-title text-dnd-ink-muted">
            Bonif. Competencia: <strong className="text-dnd-crimson">+{pb}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {ABILITIES_CONFIG.map(abil => {
            const score = character.ability_scores[abil.key] ?? 10;
            const mod = calculateAbilityModifier(score);
            const isSaveProf = character.saving_throws_prof.includes(abil.code);
            const saveBonus = calculateSkillOrSaveBonus(
              score,
              pb,
              isSaveProf ? 'proficient' : 'none',
              exhaustion
            );

            return (
              <div
                key={abil.key}
                className="p-3 rounded-lg bg-dnd-parchment-dark border border-dnd-border-antique text-center space-y-2 relative group hover:border-dnd-gold transition shadow-xs dnd-notched-sm"
              >
                <div>
                  <span className="text-xs font-dnd-title font-black tracking-wider text-dnd-crimson uppercase block">
                    {abil.code}
                  </span>
                  <span className="text-xs font-dnd-body text-dnd-ink-muted truncate block">
                    {abil.name}
                  </span>
                </div>

                {/* Modificador Grande en Óvalo/Círculo Recortado Canónico */}
                <div className="w-12 h-12 mx-auto rounded-full bg-dnd-parchment border-2 border-dnd-crimson flex items-center justify-center font-dnd-title font-black text-2xl text-dnd-crimson shadow-inner group-hover:border-dnd-gold transition">
                  {formatModifier(mod)}
                </div>

                {/* Puntuación Base */}
                <div className="text-xs font-dnd-title font-bold text-dnd-ink-muted">
                  Base: <strong className="text-dnd-ink">{score}</strong>
                </div>

                {/* Tirada de Salvación */}
                <div
                  className={`pt-1.5 border-t border-dnd-border-antique/80 flex items-center justify-between text-xs px-1 font-dnd-title ${
                    isSaveProf ? 'text-dnd-crimson font-bold' : 'text-dnd-ink-muted'
                  }`}
                  title={isSaveProf ? 'Competente en tiradas de salvación' : 'No competente'}
                >
                  <span className="flex items-center gap-1">
                    {isSaveProf ? (
                      <span className="text-dnd-gold">●</span>
                    ) : (
                      <span className="text-dnd-border-antique">○</span>
                    )}
                    TS:
                  </span>
                  <span className="font-bold">{formatModifier(saveBonus)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Agotamiento 5.5e y Recursos de Clase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-1">
          <ExhaustionSelector
            exhaustion={exhaustion}
            onUpdateExhaustion={onUpdateExhaustion}
            readOnly={readOnly}
          />
        </div>
        <div className="lg:col-span-2">
          <ClassResourcesTracker
            resources={character.class_resources}
            onUpdateResource={onUpdateResource}
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* 5. Competencias y Habilidades (Skills) - Pergamino Editorial */}
      <div className="p-4 sm:p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-dnd-gold" />
            <h3 className="font-dnd-title font-bold text-sm text-dnd-crimson tracking-wide uppercase">
              Habilidades y Competencias (18 Oficiales)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-dnd-body text-dnd-ink-muted">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-dnd-crimson" /> Competente
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-dnd-gold fill-dnd-gold" /> Pericia (Expertise)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {STANDARD_SKILLS.map(sk => {
            const skillData = character.skills[sk.name];
            let proficiency: ProficiencyLevel = 'none';
            let bonus = 0;

            const abilityScore = character.ability_scores[sk.abilityKey] ?? 10;

            if (typeof skillData === 'object' && skillData !== null) {
              proficiency = skillData.proficiency;
              bonus = skillData.bonus;
            } else if (typeof skillData === 'number') {
              bonus = skillData;
              proficiency = 'proficient';
            } else {
              // Calcular derivado si no está en el mapa
              bonus = calculateSkillOrSaveBonus(abilityScore, pb, 'none', exhaustion);
            }

            const isProf = proficiency === 'proficient';
            const isExpert = proficiency === 'expertise';

            return (
              <div
                key={sk.name}
                className={`p-2.5 rounded-sm border flex items-center justify-between transition ${
                  isExpert
                    ? 'bg-dnd-parchment-contrast border-dnd-gold text-dnd-crimson font-bold shadow-sm'
                    : isProf
                    ? 'bg-dnd-parchment-dark border-dnd-border-antique text-dnd-ink'
                    : 'bg-dnd-parchment border-dnd-border-antique/50 text-dnd-ink-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isExpert ? (
                    <Star className="w-3.5 h-3.5 text-dnd-gold fill-dnd-gold shrink-0" />
                  ) : isProf ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-dnd-crimson flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                      ✓
                    </span>
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-dnd-border-antique shrink-0" />
                  )}
                  <span className="text-xs font-dnd-body font-semibold">{sk.name}</span>
                  <span className="text-xs text-dnd-ink-muted font-dnd-title uppercase">
                    ({sk.ability})
                  </span>
                </div>

                <span
                  className={`font-dnd-title text-xs font-bold ${
                    isExpert
                      ? 'text-dnd-crimson'
                      : isProf
                      ? 'text-dnd-ink'
                      : 'text-dnd-ink-muted'
                  }`}
                >
                  {formatModifier(bonus)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
