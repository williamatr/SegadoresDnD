import React, { useState, useId } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle,
  AlertTriangle,
  X,
  Dices,
  Heart,
  Shield,
  ArrowRight,
  Plus,
  BookOpen,
  Award,
  Flame,
  Check
} from 'lucide-react';
import {
  type Character,
  CANONICAL_CLASSES,
  normalizeClassName,
  getCharacterClasses,
  getPrimaryClassEntry,
  getClassHitDie,
  validateLevelUp,
  previewLevelUp,
  calculateAbilityModifier,
  type CanonicalClassName,
  type LevelUpPreviewResult
} from '@segadores/dnd-core';

export interface LevelUpModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onConfirmLevelUp?: (updatedCharacter: Character) => Promise<void> | void;
  readOnly?: boolean;
}

export function LevelUpModal({
  character,
  isOpen,
  onClose,
  onConfirmLevelUp,
  readOnly = false
}: LevelUpModalProps) {
  const currentClasses = getCharacterClasses(character);
  const primaryClass = getPrimaryClassEntry(currentClasses);

  // Clase preseleccionada (por defecto la secundaria para facilitar catch-up, o la primaria si solo tiene una)
  const defaultTarget = currentClasses.length > 1
    ? currentClasses.find(c => c.class !== primaryClass.class)?.class ?? primaryClass.class
    : primaryClass.class;

  const [selectedClass, setSelectedClass] = useState<string>(defaultTarget);
  const [isNewClassMode, setIsNewClassMode] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('Guerrero');

  // Método de Puntos de Golpe
  const [hpMethod, setHpMethod] = useState<'average' | 'roll'>('average');
  const [rolledValue, setRolledValue] = useState<number>(5);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applySuccess, setApplySuccess] = useState<boolean>(false);

  // Identificador accesible para el diálogo
  const titleId = useId();

  if (!isOpen) return null;

  const effectiveTargetClass = isNewClassMode ? newClassName : selectedClass;
  const hitDieInfo = getClassHitDie(effectiveTargetClass);
  const conMod = calculateAbilityModifier(character.ability_scores.con);

  // Generar preview en caliente
  const preview: LevelUpPreviewResult = previewLevelUp(character, effectiveTargetClass, {
    hpMethod,
    rolledHp: hpMethod === 'roll' ? rolledValue : undefined
  });

  const { validation, diff, newFeatures } = preview;

  // Clases canónicas aún no aprendidas para el selector de nueva multiclase
  const availableNewClasses = CANONICAL_CLASSES.filter(
    cls => !currentClasses.some(c => normalizeClassName(c.class) === normalizeClassName(cls))
  );

  const handleRollDice = () => {
    setIsRolling(true);
    const dieMax = hitDieInfo.dieValue;
    let iterations = 0;
    const interval = setInterval(() => {
      setRolledValue(Math.floor(Math.random() * dieMax) + 1);
      iterations++;
      if (iterations >= 8) {
        clearInterval(interval);
        setRolledValue(Math.floor(Math.random() * dieMax) + 1);
        setIsRolling(false);
      }
    }, 60);
  };

  const handleConfirm = async () => {
    if (!validation.canLevelUp || readOnly || isApplying) return;

    try {
      setIsApplying(true);
      if (onConfirmLevelUp) {
        await onConfirmLevelUp(preview.updatedCharacter);
      }
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setIsApplying(false);
        onClose();
      }, 1000);
    } catch {
      setIsApplying(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-dnd-border shadow-2xl overflow-hidden my-auto text-slate-100">
        {/* ENCABEZADO DEL MODAL */}
        <header className="px-5 py-4 sm:px-6 sm:py-5 border-b border-dnd-border/80 bg-gradient-to-r from-dnd-card via-slate-900 to-dnd-card flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-dnd-gold shrink-0 shadow-inner">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id={titleId} className="font-fantasy font-extrabold text-lg sm:text-xl text-slate-100 uppercase tracking-wide">
                  Motor de Subida de Nivel
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-700/60 text-dnd-gold font-mono font-bold">
                  Nivel {character.level} &rarr; {character.level + 1}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {character.name} &bull; {character.character_class} &bull; {(character.experience_points || 0).toLocaleString()} PX disponibles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* CONTENIDO SCROLLEABLE */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* PASO 1: SELECCIÓN DE CLASE */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Paso 1: Selecciona la clase a subir
              </span>
              <span className="text-[11px] text-slate-400">
                Clase principal actual: <strong className="text-amber-300">{primaryClass.class} (Nv. {primaryClass.level})</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {/* Opciones de clases actuales */}
              {currentClasses.map(clsEntry => {
                const isSelected = !isNewClassMode && normalizeClassName(selectedClass) === normalizeClassName(clsEntry.class);
                const die = getClassHitDie(clsEntry.class);
                const isPrimary = clsEntry.class === primaryClass.class;

                return (
                  <button
                    key={clsEntry.class}
                    type="button"
                    onClick={() => {
                      setIsNewClassMode(false);
                      setSelectedClass(clsEntry.class);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 relative overflow-hidden group ${
                      isSelected
                        ? 'bg-amber-950/40 border-dnd-gold shadow-lg shadow-amber-950/20 ring-1 ring-dnd-gold/50'
                        : 'bg-dnd-card/80 border-dnd-border hover:border-slate-600 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-fantasy font-bold text-sm text-slate-100">
                        {clsEntry.class}
                      </span>
                      {isPrimary ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-amber-800/40 text-amber-300 font-mono">
                          Primaria
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 font-mono">
                          Secundaria (50%)
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between w-full text-xs">
                      <span className="text-slate-400 font-mono">
                        Nv. {clsEntry.level} &rarr; <strong className="text-amber-400 font-bold">Nv. {clsEntry.level + 1}</strong>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Dado {die.die}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </button>
                );
              })}

              {/* Botón de Nueva Multiclase */}
              <button
                type="button"
                onClick={() => {
                  setIsNewClassMode(true);
                  if (availableNewClasses.length > 0 && !newClassName) {
                    setNewClassName(availableNewClasses[0]);
                  }
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 relative group ${
                  isNewClassMode
                    ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/20 ring-1 ring-purple-500/50'
                    : 'bg-dnd-card/60 border-dashed border-slate-700 hover:border-purple-400 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-fantasy font-bold text-sm text-purple-200 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-purple-400" />
                    Nueva Multiclase
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-700 text-purple-300 font-mono">
                    Nv. 0 &rarr; 1
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Aprende una nueva senda marcial o mágica
                </span>
              </button>
            </div>

            {/* Selector de clase si es nueva multiclase */}
            {isNewClassMode && (
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div>
                  <label htmlFor="new-class-select" className="font-semibold text-purple-300 text-xs block mb-1">
                    Elige la nueva clase que aprenderás:
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Al ser una clase secundaria que inicia en nivel 1, se beneficia del <strong className="text-emerald-300">descuento del 50% de Alcance</strong>.
                  </p>
                </div>
                <select
                  id="new-class-select"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-purple-600 text-slate-100 font-fantasy text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {availableNewClasses.map(cls => (
                    <option key={cls} value={cls}>
                      {cls} (Dado {getClassHitDie(cls).die})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </section>

          {/* PASO 2: VALIDACIÓN DE PX Y REGLA DE CAMPAÑA */}
          <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-dnd-card to-slate-900 border border-dnd-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dnd-border/60 pb-3">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-dnd-gold" />
                Paso 2: Validación de Experiencia (Regla de Campaña)
              </span>

              {validation.isCatchUpHalfCost ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/70 text-emerald-300 font-semibold font-mono flex items-center gap-1 w-fit">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Regla de Campaña: 50% Catch-Up Activo
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-600 text-slate-300 font-mono w-fit">
                  Coste Oficial Completo (100% RAW)
                </span>
              )}
            </div>

            {/* Tarjetas de Métricas de Experiencia */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">PX Actuales</span>
                <span className="text-base sm:text-lg font-fantasy font-bold text-dnd-gold">
                  {validation.currentXp.toLocaleString()} PX
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Coste Nivel {validation.nextCharacterTotalLevel}</span>
                <span className="text-base sm:text-lg font-fantasy font-bold text-amber-300">
                  {validation.xpCost.toLocaleString()} PX
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Coste Oficial 5.5e</span>
                <span className="text-base sm:text-lg font-fantasy font-bold text-slate-400 line-through">
                  {validation.officialRawCost.toLocaleString()} PX
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                <span className="text-[10px] text-emerald-400 uppercase font-mono block">Ahorro de Campaña</span>
                <span className="text-base sm:text-lg font-fantasy font-bold text-emerald-300">
                  {validation.savings > 0 ? `-${validation.savings.toLocaleString()} PX` : '0 PX'}
                </span>
              </div>
            </div>

            {/* Alerta de Validación de PX */}
            {validation.canLevelUp ? (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-600/60 text-emerald-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>¡Experiencia suficiente!</strong> Tras la subida te quedarán{' '}
                    <strong className="text-white font-mono">{validation.remainingXpAfterLevelUp.toLocaleString()} PX</strong>.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-700 text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>
                    <strong>Puntos de Experiencia insuficientes:</strong> Faltan{' '}
                    <strong className="text-white font-mono">{validation.missingXp.toLocaleString()} PX</strong> para confirmar.
                  </span>
                </div>
                <span className="text-[11px] text-red-300 font-mono bg-red-900/50 px-2 py-1 rounded-lg w-fit">
                  Puedes previsualizar los cambios antes de confirmar
                </span>
              </div>
            )}
          </section>

          {/* PASO 3: MÉTODO DE PUNTOS DE GOLPE (PG) */}
          <section className="space-y-3">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-400" />
              Paso 3: Incremento de Puntos de Golpe ({effectiveTargetClass} usa dado {hitDieInfo.die})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opción 1: Media fija */}
              <button
                type="button"
                onClick={() => setHpMethod('average')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                  hpMethod === 'average'
                    ? 'bg-amber-950/30 border-dnd-gold shadow-md ring-1 ring-dnd-gold/50'
                    : 'bg-dnd-card/70 border-dnd-border hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-100">
                    <span>Media Fija Oficial</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900/70 text-amber-300 font-mono">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {hitDieInfo.avgHp} (Media) + {conMod} (Mod. CON) ={' '}
                    <strong className="text-emerald-400">+{Math.max(1, hitDieInfo.avgHp + conMod)} PG Máximos</strong>
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  hpMethod === 'average' ? 'border-dnd-gold bg-dnd-gold text-slate-950' : 'border-slate-600'
                }`}>
                  {hpMethod === 'average' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>

              {/* Opción 2: Tirar Dado */}
              <button
                type="button"
                onClick={() => setHpMethod('roll')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                  hpMethod === 'roll'
                    ? 'bg-amber-950/30 border-dnd-gold shadow-md ring-1 ring-dnd-gold/50'
                    : 'bg-dnd-card/70 border-dnd-border hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-100">
                    <Dices className="w-4 h-4 text-amber-400" />
                    <span>Tirar Dado ({hitDieInfo.die})</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Tirada manual o interactiva + Mod. CON ({conMod})
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  hpMethod === 'roll' ? 'border-dnd-gold bg-dnd-gold text-slate-950' : 'border-slate-600'
                }`}>
                  {hpMethod === 'roll' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            </div>

            {/* Panel de tirada interactiva si eligió 'roll' */}
            {hpMethod === 'roll' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isRolling}
                    onClick={handleRollDice}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50"
                  >
                    <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                    <span>{isRolling ? 'Tirando...' : `Lanzar 1${hitDieInfo.die}`}</span>
                  </button>
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-400 text-xs">Resultado:</span>
                    <span className="text-xl font-fantasy font-extrabold text-dnd-gold font-mono">
                      {rolledValue}
                    </span>
                    <span className="text-slate-500 text-xs">en {hitDieInfo.die}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-300">
                    Ganancia final:{' '}
                    <strong className="text-emerald-400 font-mono text-sm">
                      +{Math.max(1, rolledValue + conMod)} PG
                    </strong>{' '}
                    ({rolledValue} + CON {conMod})
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* PASO 4: VISTA PREVIA INTERACTIVA ("MIRA, ASÍ QUEDARÍA TU PERSONAJE") */}
          <section className="space-y-4 pt-2 border-t border-dnd-border/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-fantasy font-extrabold text-base text-amber-300 uppercase tracking-wide flex items-center gap-2">
                  <Award className="w-5 h-5 text-dnd-gold" />
                  Vista Previa: Así quedaría tu héroe
                </h3>
                <p className="text-xs text-slate-400">
                  Comparativa de estadísticas antes y después de aplicar la subida de nivel
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                Simulación en tiempo real
              </span>
            </div>

            {/* TABLERO DE COMPARATIVA ANTES VS DESPUÉS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {/* Nivel Total */}
              <div className="p-3 rounded-2xl bg-dnd-card border border-dnd-border space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Nivel Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 line-through font-mono">{diff.totalLevel.before}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-dnd-gold shrink-0" />
                  <span className="text-lg font-fantasy font-bold text-amber-300">
                    {diff.totalLevel.after}
                  </span>
                </div>
              </div>

              {/* Clases / Multiclase */}
              <div className="p-3 rounded-2xl bg-dnd-card border border-dnd-border space-y-1 col-span-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Composición de Clases</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-400 line-through truncate max-w-[120px]">{diff.classes.before}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-dnd-gold shrink-0" />
                  <span className="text-xs font-bold text-emerald-300 font-mono">
                    {diff.classes.after}
                  </span>
                </div>
              </div>

              {/* Puntos de Golpe Máximos */}
              <div className="p-3 rounded-2xl bg-dnd-card border border-dnd-border space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Puntos de Golpe (PG)</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 line-through font-mono">{diff.maxHp.before}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="text-lg font-fantasy font-bold text-emerald-400">
                    {diff.maxHp.after}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    (+{diff.maxHp.increase})
                  </span>
                </div>
              </div>

              {/* Dados de Golpe */}
              <div className="p-3 rounded-2xl bg-dnd-card border border-dnd-border space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Dados de Golpe</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-400 line-through font-mono">{diff.hitDice.before}</span>
                  <ArrowRight className="w-3 h-3 text-dnd-gold shrink-0" />
                  <span className="text-xs font-bold text-amber-300 font-mono">
                    {diff.hitDice.after}
                  </span>
                </div>
              </div>

              {/* Puntos de Experiencia Restantes */}
              <div className="p-3 rounded-2xl bg-dnd-card border border-dnd-border space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">PX Restantes</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 line-through font-mono">{diff.experiencePoints.before.toLocaleString()}</span>
                  <ArrowRight className="w-3 h-3 text-dnd-gold shrink-0" />
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {diff.experiencePoints.after.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bonificador de Competencia */}
              <div className="p-3 rounded-2xl bg-dnd-card border border-dnd-border space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Competencia (PB)</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">+{diff.proficiencyBonus.before}</span>
                  {diff.proficiencyBonus.increased ? (
                    <>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-sm font-bold text-emerald-300 font-mono">
                        +{diff.proficiencyBonus.after} (+1)
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">(Sin cambio)</span>
                  )}
                </div>
              </div>

              {/* Recursos de Clase Modificados (ej. Ki) */}
              {diff.resources.length > 0 && (
                <div className="p-3 rounded-2xl bg-dnd-card border border-dnd-border space-y-1 col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Recursos de Clase Actualizados</span>
                  <div className="space-y-1">
                    {diff.resources.map(res => (
                      <div key={res.name} className="flex items-center justify-between text-xs font-mono">
                        <span className="text-amber-200">{res.name}:</span>
                        <span className="text-emerald-400 font-bold">
                          {res.isNew ? `Nuevo (Máx: ${res.afterMax})` : `${res.beforeMax} &rarr; ${res.afterMax}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DESGLOSE DE NUEVOS RASGOS Y HABILIDADES */}
            <div className="space-y-2.5 pt-2">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Nuevos Rasgos Adquiridos en {effectiveTargetClass} Nivel {validation.targetClassNextLevel}
              </span>

              {newFeatures.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {newFeatures.map(feat => (
                    <div
                      key={feat.name}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-900/40 space-y-1.5 hover:border-amber-700/60 transition shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-fantasy font-bold text-sm text-dnd-gold">
                          {feat.name}
                        </span>
                        {feat.type && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 uppercase font-mono">
                            {feat.type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                  Mejoras de dados de golpe, espacios de conjuro y avance general de clase para {effectiveTargetClass} nivel {validation.targetClassNextLevel}.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* PIE DE ACCIONES DEL MODAL */}
        <footer className="px-5 py-4 sm:px-6 sm:py-5 border-t border-dnd-border/80 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400">
            {validation.canLevelUp ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Requisitos validados. Se deducirán {validation.xpCost.toLocaleString()} PX de tu personaje.
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {validation.reason || 'Puntos de Experiencia insuficientes.'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isApplying}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={!validation.canLevelUp || readOnly || isApplying}
              onClick={handleConfirm}
              className={`px-5 py-2.5 rounded-xl font-fantasy font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg ${
                applySuccess
                  ? 'bg-emerald-600 text-white'
                  : validation.canLevelUp && !readOnly
                    ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 active:scale-95 shadow-amber-950/30'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {applySuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>¡Nivel Aplicado con Éxito!</span>
                </>
              ) : isApplying ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Actualizando Personaje...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Confirmar Subida de Nivel</span>
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
