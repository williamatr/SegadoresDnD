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
      <div className="p-4 sm:p-5 rounded-sm bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] dnd-notched shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] flex items-center justify-center text-[#58180D] shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-[#c29b38]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-dnd-title font-black text-base text-[#58180D] uppercase tracking-wide">
                  Nivel {xpProgress.currentLevel}
                </span>
                {character.multiclass && character.multiclass.length > 0 && (
                  <span className="text-xs text-[#c45b1d] font-dnd-title font-bold">
                    ({character.multiclass.map(m => `${m.class} ${m.level}`).join(' / ')})
                  </span>
                )}
              </div>
              <p className="text-xs text-[#58544d] font-dnd-body">
                {xpProgress.isMaxLevel ? (
                  <span className="text-[#854d0e] font-bold">¡Nivel Épico Máximo alcanzado (Nivel 20)!</span>
                ) : (
                  <>
                    Próximo objetivo: <strong className="text-[#242528]">Nivel {xpProgress.nextLevel}</strong> ({xpProgress.nextLevelThreshold.toLocaleString()} PX acumulados)
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <div className="text-left sm:text-right">
              <div className="flex items-baseline sm:justify-end gap-1.5">
                <span className="text-xl sm:text-2xl font-dnd-title font-black text-[#58180D]">
                  {xpProgress.currentXp.toLocaleString()}
                </span>
                <span className="text-xs font-dnd-body text-[#58544d]">
                  / {xpProgress.isMaxLevel ? 'MAX' : `${xpProgress.nextLevelThreshold.toLocaleString()} PX`}
                </span>
              </div>
              {!xpProgress.isMaxLevel && (
                <span className="text-[11px] text-[#c45b1d] font-dnd-body italic block">
                  Faltan {xpProgress.remainingXp.toLocaleString()} PX para subir de nivel
                </span>
              )}
            </div>

            {!readOnly && onOpenLevelUp && !xpProgress.isMaxLevel && (
              <button
                type="button"
                onClick={onOpenLevelUp}
                className="px-3 py-1.5 rounded-sm bg-gradient-to-r from-[#c45b1d] to-[#c29b38] hover:from-[#a34712] hover:to-[#a88225] text-[#fdf6ea] font-dnd-title font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-[#c29b38] transition active:scale-95 self-start sm:self-end"
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
          <div className="w-full h-3 rounded-full bg-[#ede2cb] border border-[#d4c2a5] overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#c45b1d] via-[#c29b38] to-[#e5b960] transition-all duration-500 rounded-full"
              style={{ width: `${xpProgress.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#58544d] font-dnd-body">
            <span>Umbral Nv. {xpProgress.currentLevel}: {xpProgress.currentLevelThreshold.toLocaleString()} PX</span>
            <span className="font-bold text-[#58180D]">{xpProgress.progressPercent}% completado</span>
            <span>Objetivo Nv. {xpProgress.nextLevel}: {xpProgress.nextLevelThreshold.toLocaleString()} PX</span>
          </div>
        </div>
      </div>

      {/* 1. Métricas Defensivas y de Combate Principales (Escudo Heráldico CA, Velocidad, Iniciativa, Percepción) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-stretch">
        {/* Clase de Armadura (Escudo Heráldico Medieval D&D 5e) */}
        <div className="p-3.5 sm:p-4 rounded-sm bg-[#fdf6ea] border-2 border-[#d4c2a5] text-[#242528] dnd-notched flex items-center justify-between shadow-md relative overflow-hidden group">
          <div className="space-y-0.5">
            <span className="text-[11px] font-dnd-title font-bold text-[#58180D] uppercase tracking-wider block">
              Clase Armadura
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-dnd-title font-black text-[#58180D]">
                {effectiveAc}
              </span>
              <span className="text-[10px] text-[#58544d] uppercase font-dnd-title font-semibold">CA</span>
            </div>
            {evaluatedState && evaluatedState.acBreakdown.length > 0 && (
              <span className="text-[10px] text-[#58544d] block truncate max-w-[120px] font-dnd-body" title={evaluatedState.acBreakdown.join(', ')}>
                {evaluatedState.acBreakdown[0]}
              </span>
            )}
          </div>
          <HeraldicShield value={effectiveAc} label="" size="sm" />
        </div>

        {/* Velocidad */}
        <div className="p-3.5 sm:p-4 rounded-sm bg-[#fdf6ea] border-2 border-[#d4c2a5] text-[#242528] dnd-notched flex items-center justify-between shadow-md">
          <div className="space-y-0.5">
            <span className="text-[11px] font-dnd-title font-bold text-[#58180D] uppercase tracking-wider block">
              Velocidad
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-dnd-title font-black text-[#242528]">
                {effectiveSpeed}
              </span>
              <span className="text-[10px] text-[#58544d] font-dnd-body">pies</span>
            </div>
            {exhaustion > 0 && (
              <span className="text-[10px] text-[#58180D] font-bold block">
                -{exhaustion * 5} pies por fatiga
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] flex items-center justify-center text-[#58180D] shrink-0">
            <Footprints className="w-5 h-5" />
          </div>
        </div>

        {/* Iniciativa */}
        <div className="p-3.5 sm:p-4 rounded-sm bg-[#fdf6ea] border-2 border-[#d4c2a5] text-[#242528] dnd-notched flex items-center justify-between shadow-md">
          <div className="space-y-0.5">
            <span className="text-[11px] font-dnd-title font-bold text-[#58180D] uppercase tracking-wider block">
              Iniciativa
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-dnd-title font-black text-[#242528]">
                {formatModifier(character.initiative_modifier)}
              </span>
            </div>
            <span className="text-[10px] text-[#58544d] block font-dnd-body">DES base</span>
          </div>
          <div className="w-10 h-10 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] flex items-center justify-center text-[#c45b1d] shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* Percepción Pasiva */}
        <div className="p-3.5 sm:p-4 rounded-sm bg-[#fdf6ea] border-2 border-[#d4c2a5] text-[#242528] dnd-notched flex items-center justify-between shadow-md">
          <div className="space-y-0.5">
            <span className="text-[11px] font-dnd-title font-bold text-[#58180D] uppercase tracking-wider block">
              Percepción Pas.
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-dnd-title font-black text-[#242528]">
                {character.passive_perception}
              </span>
              <span className="text-[10px] text-[#58544d] font-dnd-body">SAB</span>
            </div>
            <span className="text-[10px] text-[#58544d] block font-dnd-body">10 + SAB + PB</span>
          </div>
          <div className="w-10 h-10 rounded-sm bg-[#ede2cb] border border-[#d4c2a5] flex items-center justify-center text-[#854d0e] shrink-0">
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
      <div className="p-4 sm:p-5 rounded-sm bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] dnd-notched space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-[#d4c2a5]/80 pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#c29b38]" />
            <h3 className="font-dnd-title font-bold text-sm text-[#58180D] tracking-wide uppercase">
              Puntuaciones de Característica y Salvaciones
            </h3>
          </div>
          <span className="text-xs font-dnd-title text-[#58544d]">
            Bonif. Competencia: <strong className="text-[#58180D]">+{pb}</strong>
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
                className="p-3 rounded-sm bg-[#f4ebe1] border-2 border-[#d4c2a5] text-center space-y-2 relative group hover:border-[#c29b38] transition shadow-sm dnd-notched-sm"
              >
                <div>
                  <span className="text-[10px] font-dnd-title font-black tracking-wider text-[#58180D] uppercase block">
                    {abil.code}
                  </span>
                  <span className="text-[11px] font-dnd-body text-[#58544d] truncate block">
                    {abil.name}
                  </span>
                </div>

                {/* Modificador Grande en Óvalo/Círculo Recortado Canónico */}
                <div className="w-12 h-12 mx-auto rounded-full bg-[#fdf6ea] border-2 border-[#58180D] flex items-center justify-center font-dnd-title font-black text-2xl text-[#58180D] shadow-inner group-hover:border-[#c29b38] transition">
                  {formatModifier(mod)}
                </div>

                {/* Puntuación Base */}
                <div className="text-[11px] font-dnd-title font-bold text-[#58544d]">
                  Base: <strong className="text-[#242528]">{score}</strong>
                </div>

                {/* Tirada de Salvación */}
                <div
                  className={`pt-1.5 border-t border-[#d4c2a5]/80 flex items-center justify-between text-[11px] px-1 font-dnd-title ${
                    isSaveProf ? 'text-[#58180D] font-bold' : 'text-[#58544d]'
                  }`}
                  title={isSaveProf ? 'Competente en tiradas de salvación' : 'No competente'}
                >
                  <span className="flex items-center gap-1">
                    {isSaveProf ? (
                      <span className="text-[#c29b38]">●</span>
                    ) : (
                      <span className="text-[#d4c2a5]">○</span>
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
      <div className="p-4 sm:p-5 rounded-sm bg-[#fdf6ea] text-[#242528] border-2 border-[#d4c2a5] dnd-notched space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-[#d4c2a5]/80 pb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#c29b38]" />
            <h3 className="font-dnd-title font-bold text-sm text-[#58180D] tracking-wide uppercase">
              Habilidades y Competencias (18 Oficiales)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-dnd-body text-[#58544d]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#58180D]" /> Competente
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#c29b38] fill-[#c29b38]" /> Pericia (Expertise)
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
                    ? 'bg-[#ede2cb] border-[#c29b38] text-[#58180D] font-bold shadow-sm'
                    : isProf
                    ? 'bg-[#f4ebe1] border-[#d4c2a5] text-[#242528]'
                    : 'bg-[#fdf6ea] border-[#d4c2a5]/50 text-[#58544d]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isExpert ? (
                    <Star className="w-3.5 h-3.5 text-[#c29b38] fill-[#c29b38] shrink-0" />
                  ) : isProf ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-[#58180D] flex items-center justify-center text-[9px] text-[#fdf6ea] font-bold shrink-0">
                      ✓
                    </span>
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-[#d4c2a5] shrink-0" />
                  )}
                  <span className="text-xs font-dnd-body font-semibold">{sk.name}</span>
                  <span className="text-[10px] text-[#58544d] font-dnd-title uppercase">
                    ({sk.ability})
                  </span>
                </div>

                <span
                  className={`font-dnd-title text-xs font-bold ${
                    isExpert
                      ? 'text-[#58180D]'
                      : isProf
                      ? 'text-[#242528]'
                      : 'text-[#58544d]'
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
