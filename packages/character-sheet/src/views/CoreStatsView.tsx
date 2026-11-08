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
      {/* 0. Barra de Progreso de Nivel y Experiencia (XP) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-dnd-card via-slate-900 to-dnd-card border border-dnd-border shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-700/50 flex items-center justify-center text-dnd-gold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-fantasy font-extrabold text-base text-slate-100 uppercase tracking-wide">
                  Nivel {xpProgress.currentLevel}
                </span>
                {character.multiclass && character.multiclass.length > 0 && (
                  <span className="text-xs text-amber-300/80 font-mono">
                    ({character.multiclass.map(m => `${m.class} ${m.level}`).join(' / ')})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {xpProgress.isMaxLevel ? (
                  <span className="text-dnd-gold font-semibold">¡Nivel Épico Máximo alcanzado (Nivel 20)!</span>
                ) : (
                  <>
                    Próximo objetivo: <strong className="text-slate-200">Nivel {xpProgress.nextLevel}</strong> ({xpProgress.nextLevelThreshold.toLocaleString()} PX acumulados)
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <div className="text-left sm:text-right">
              <div className="flex items-baseline sm:justify-end gap-1.5">
                <span className="text-xl sm:text-2xl font-fantasy font-extrabold text-dnd-gold">
                  {xpProgress.currentXp.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  / {xpProgress.isMaxLevel ? 'MAX' : `${xpProgress.nextLevelThreshold.toLocaleString()} PX`}
                </span>
              </div>
              {!xpProgress.isMaxLevel && (
                <span className="text-[11px] text-amber-300 font-mono block">
                  Faltan {xpProgress.remainingXp.toLocaleString()} PX para subir de nivel
                </span>
              )}
            </div>

            {!readOnly && onOpenLevelUp && !xpProgress.isMaxLevel && (
              <button
                type="button"
                onClick={onOpenLevelUp}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-fantasy font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition active:scale-95 self-start sm:self-end"
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
          <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
              style={{ width: `${xpProgress.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>Umbral Nv. {xpProgress.currentLevel}: {xpProgress.currentLevelThreshold.toLocaleString()} PX</span>
            <span className="font-bold text-amber-400">{xpProgress.progressPercent}% completado</span>
            <span>Objetivo Nv. {xpProgress.nextLevel}: {xpProgress.nextLevelThreshold.toLocaleString()} PX</span>
          </div>
        </div>
      </div>

      {/* 1. Métricas Defensivas y de Combate Principales (CA, Velocidad, Iniciativa, Percepción) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Clase de Armadura */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-dnd-card border border-dnd-border flex items-center justify-between shadow-md relative overflow-hidden group">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Clase Armadura
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-fantasy font-extrabold text-amber-300">
                {effectiveAc}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-mono">CA</span>
            </div>
            {evaluatedState && evaluatedState.acBreakdown.length > 0 && (
              <span className="text-[10px] text-slate-400 block truncate max-w-[120px]" title={evaluatedState.acBreakdown.join(', ')}>
                {evaluatedState.acBreakdown[0]}
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-dnd-gold shrink-0">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Velocidad */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-dnd-card border border-dnd-border flex items-center justify-between shadow-md">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Velocidad
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-fantasy font-extrabold text-slate-100">
                {effectiveSpeed}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">pies</span>
            </div>
            {exhaustion > 0 && (
              <span className="text-[10px] text-red-400 font-semibold block">
                -{exhaustion * 5} pies por fatiga
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
            <Footprints className="w-5 h-5" />
          </div>
        </div>

        {/* Iniciativa */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-dnd-card border border-dnd-border flex items-center justify-between shadow-md">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Iniciativa
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-fantasy font-extrabold text-slate-100">
                {formatModifier(character.initiative_modifier)}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">DES base</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Percepción Pasiva */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-dnd-card border border-dnd-border flex items-center justify-between shadow-md">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Percepción Pas.
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-fantasy font-extrabold text-slate-100">
                {character.passive_perception}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">SAB</span>
            </div>
            <span className="text-[10px] text-slate-500 block">10 + SAB + PB</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0">
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

      {/* 3. Atributos Nucleares (FUE, DES, CON, INT, SAB, CAR) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-dnd-card border border-dnd-border space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-dnd-border/60 pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-dnd-gold" />
            <h3 className="font-fantasy font-bold text-sm text-slate-100 tracking-wide uppercase">
              Puntuaciones de Característica y Salvaciones
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Bonif. Competencia: <strong className="text-dnd-gold">+{pb}</strong>
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
                className="p-3 rounded-xl bg-dnd-surface border border-dnd-border text-center space-y-2 relative group hover:border-dnd-gold/60 transition"
              >
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                    {abil.code}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate block">
                    {abil.name}
                  </span>
                </div>

                {/* Modificador Grande */}
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-fantasy font-extrabold text-xl text-slate-100 shadow-inner group-hover:border-dnd-gold transition">
                  {formatModifier(mod)}
                </div>

                {/* Puntuación Base */}
                <div className="text-[11px] font-mono font-semibold text-slate-400">
                  Base: <strong className="text-slate-200">{score}</strong>
                </div>

                {/* Tirada de Salvación */}
                <div
                  className={`pt-1.5 border-t border-dnd-border/60 flex items-center justify-between text-[11px] px-1 ${
                    isSaveProf ? 'text-amber-300 font-bold' : 'text-slate-400'
                  }`}
                  title={isSaveProf ? 'Competente en tiradas de salvación' : 'No competente'}
                >
                  <span className="flex items-center gap-1">
                    {isSaveProf && <Check className="w-3 h-3 text-dnd-gold" />}
                    TS:
                  </span>
                  <span className="font-mono">{formatModifier(saveBonus)}</span>
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

      {/* 5. Competencias y Habilidades (Skills) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-dnd-card border border-dnd-border space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-dnd-border/60 pb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-dnd-gold" />
            <h3 className="font-fantasy font-bold text-sm text-slate-100 tracking-wide uppercase">
              Habilidades y Competencias (18 Oficiales)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-dnd-gold" /> Competente
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
                className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                  isExpert
                    ? 'bg-amber-950/20 border-dnd-gold/60 text-slate-100'
                    : isProf
                    ? 'bg-dnd-surface border-slate-700 text-slate-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isExpert ? (
                    <Star className="w-3.5 h-3.5 text-dnd-gold fill-dnd-gold shrink-0" />
                  ) : isProf ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-dnd-gold flex items-center justify-center text-[9px] text-slate-950 font-bold shrink-0">
                      ✓
                    </span>
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span className="text-xs font-medium">{sk.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">
                    ({sk.ability})
                  </span>
                </div>

                <span
                  className={`font-mono text-xs font-bold ${
                    isExpert
                      ? 'text-dnd-gold'
                      : isProf
                      ? 'text-amber-300'
                      : 'text-slate-400'
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
