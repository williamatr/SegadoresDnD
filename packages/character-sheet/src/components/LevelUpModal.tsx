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

  // Método de Puntos de Golpe: 'average' | 'roll' | 'manual'
  const [hpMethod, setHpMethod] = useState<'average' | 'roll' | 'manual'>('average');
  const [rolledValue, setRolledValue] = useState<number>(5);
  const [manualTableDice, setManualTableDice] = useState<number>(5);
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
    rolledHp: hpMethod === 'roll' ? rolledValue : hpMethod === 'manual' ? manualTableDice : undefined
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
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-sm bg-dnd-parchment border-2 border-dnd-border-antique dnd-notched shadow-2xl overflow-hidden my-auto text-dnd-ink">
        {/* ENCABEZADO DEL MODAL */}
        <header className="px-5 py-4 sm:px-6 sm:py-5 border-b border-dnd-border-antique bg-dnd-parchment-dark flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-sm bg-dnd-crimson border border-dnd-gold flex items-center justify-center text-dnd-gold shrink-0 shadow-sm">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id={titleId} className="font-dnd-title font-bold text-lg sm:text-xl text-dnd-crimson uppercase tracking-wide">
                  Motor de Subida de Nivel
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-gold text-dnd-gold font-dnd-title font-bold">
                  Nivel {character.level} &rarr; {character.level + 1}
                </span>
              </div>
              <p className="text-xs text-dnd-ink-muted font-dnd-body">
                {character.name} &bull; {character.character_class} &bull; {(character.experience_points || 0).toLocaleString()} PX disponibles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-dnd-ink-muted hover:text-dnd-ink hover:bg-dnd-parchment-contrast transition"
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
              <span className="font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-dnd-gold" />
                Paso 1: Selecciona la clase a subir
              </span>
              <span className="text-[11px] text-dnd-ink-muted font-dnd-body">
                Clase principal actual: <strong className="text-dnd-crimson font-dnd-title">{primaryClass.class} (Nv. {primaryClass.level})</strong>
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
                    className={`p-3.5 rounded-sm border text-left transition flex flex-col justify-between gap-2 relative overflow-hidden group ${
                      isSelected
                        ? 'bg-dnd-parchment border-dnd-gold shadow-md ring-1 ring-dnd-gold text-dnd-ink'
                        : 'bg-dnd-parchment-contrast border-dnd-border-antique hover:border-dnd-gold hover:bg-dnd-parchment text-dnd-ink-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-dnd-title font-bold text-sm text-dnd-ink">
                        {clsEntry.class}
                      </span>
                      {isPrimary ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-sm bg-dnd-gold-surface border border-dnd-gold text-dnd-gold font-dnd-title">
                          Primaria
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-sm bg-emerald-900/20 border border-emerald-600/40 text-emerald-700 dark:text-emerald-400 font-dnd-title">
                          Secundaria (50%)
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between w-full text-xs">
                      <span className="text-dnd-ink-muted font-dnd-body">
                        Nv. {clsEntry.level} &rarr; <strong className="text-dnd-crimson font-dnd-title font-bold">Nv. {clsEntry.level + 1}</strong>
                      </span>
                      <span className="text-[10px] text-dnd-ink-subtle font-dnd-title">
                        Dado {die.die}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-dnd-gold animate-pulse" />
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
                className={`p-3.5 rounded-sm border text-left transition flex flex-col justify-between gap-2 relative group ${
                  isNewClassMode
                    ? 'bg-dnd-parchment border-dnd-crimson shadow-md ring-1 ring-dnd-crimson'
                    : 'bg-dnd-parchment-contrast/60 border-dashed border-dnd-border-antique hover:border-dnd-gold hover:bg-dnd-parchment'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-dnd-title font-bold text-sm text-dnd-crimson flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-dnd-gold" />
                    Nueva Multiclase
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-crimson font-dnd-title">
                    Nv. 0 &rarr; 1
                  </span>
                </div>
                <span className="text-xs text-dnd-ink-muted font-dnd-body">
                  Aprende una nueva senda marcial o mágica
                </span>
              </button>
            </div>

            {/* Selector de clase si es nueva multiclase */}
            {isNewClassMode && (
              <div className="p-4 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div>
                  <label htmlFor="new-class-select" className="font-semibold text-dnd-crimson font-dnd-title text-xs block mb-1">
                    Elige la nueva clase que aprenderás:
                  </label>
                  <p className="text-[11px] text-dnd-ink-muted font-dnd-body">
                    Al ser una clase secundaria que inicia en nivel 1, se beneficia del <strong className="text-emerald-700 dark:text-emerald-400 font-dnd-title font-bold">descuento del 50% de Alcance</strong>.
                  </p>
                </div>
                <select
                  id="new-class-select"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  className="px-3.5 py-2 rounded-sm bg-dnd-parchment border border-dnd-border-antique text-dnd-ink font-dnd-title text-sm focus:outline-none focus:ring-2 focus:ring-dnd-gold"
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
          <section className="p-4 sm:p-5 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique space-y-3 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dnd-border-antique pb-3">
              <span className="font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-dnd-gold" />
                Paso 2: Validación de Experiencia (Regla de Campaña)
              </span>

              {validation.isCatchUpHalfCost ? (
                <span className="text-xs px-2.5 py-0.5 rounded-sm bg-dnd-gold-surface border border-dnd-gold text-dnd-crimson font-bold font-dnd-title uppercase flex items-center gap-1 w-fit shadow-xs">
                  <Zap className="w-3.5 h-3.5 text-dnd-gold" />
                  Regla de Campaña: 50% Catch-Up Activo
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted font-dnd-title uppercase w-fit">
                  Coste Oficial Completo (100% RAW)
                </span>
              )}
            </div>

            {/* Tarjetas de Métricas de Experiencia */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-sm bg-dnd-parchment border border-dnd-border-antique shadow-xs">
                <span className="text-[10px] text-dnd-ink-muted uppercase font-dnd-title font-semibold block">PX Actuales</span>
                <span className="text-base sm:text-lg font-dnd-title font-black text-dnd-crimson">
                  {validation.currentXp.toLocaleString()} PX
                </span>
              </div>

              <div className="p-3 rounded-sm bg-dnd-parchment border border-dnd-border-antique shadow-xs">
                <span className="text-[10px] text-dnd-ink-muted uppercase font-dnd-title font-semibold block">Coste Nivel {validation.nextCharacterTotalLevel}</span>
                <span className="text-base sm:text-lg font-dnd-title font-black text-dnd-gold">
                  {validation.xpCost.toLocaleString()} PX
                </span>
              </div>

              <div className="p-3 rounded-sm bg-dnd-parchment border border-dnd-border-antique shadow-xs">
                <span className="text-[10px] text-dnd-ink-muted uppercase font-dnd-title font-semibold block">Coste Oficial 5.5e</span>
                <span className="text-base sm:text-lg font-dnd-title font-bold text-dnd-ink-muted line-through">
                  {validation.officialRawCost.toLocaleString()} PX
                </span>
              </div>

              <div className="p-3 rounded-sm bg-dnd-parchment-contrast border border-dnd-gold shadow-xs">
                <span className="text-[10px] text-dnd-gold uppercase font-dnd-title font-bold block">Ahorro de Campaña</span>
                <span className="text-base sm:text-lg font-dnd-title font-black text-[#15803d]">
                  {validation.savings > 0 ? `-${validation.savings.toLocaleString()} PX` : '0 PX'}
                </span>
              </div>
            </div>

            {/* Alerta de Validación de PX */}
            {validation.canLevelUp ? (
              <div className="p-3 rounded-sm bg-dnd-parchment border border-dnd-border-antique text-dnd-ink flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#15803d] shrink-0" />
                  <span className="font-dnd-body text-xs">
                    <strong className="text-dnd-crimson font-dnd-title">¡Experiencia suficiente!</strong> Tras la subida te quedarán{' '}
                    <strong className="text-dnd-ink font-dnd-title">{validation.remainingXpAfterLevelUp.toLocaleString()} PX</strong>.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-sm bg-dnd-crimson-surface border border-dnd-crimson text-dnd-crimson flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-dnd-crimson shrink-0" />
                  <span className="font-dnd-body text-xs">
                    <strong className="font-dnd-title">Puntos de Experiencia insuficientes:</strong> Faltan{' '}
                    <strong className="font-dnd-title">{validation.missingXp.toLocaleString()} PX</strong> para confirmar.
                  </span>
                </div>
                <span className="text-[11px] text-dnd-crimson font-dnd-title bg-dnd-parchment px-2 py-1 rounded-sm border border-dnd-crimson/30 w-fit">
                  Puedes previsualizar los cambios antes de confirmar
                </span>
              </div>
            )}
          </section>

          {/* PASO 3: MÉTODO DE PUNTOS DE GOLPE (PG) */}
          <section className="space-y-3">
            <span className="font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-dnd-crimson" />
              Paso 3: Incremento de Puntos de Golpe ({effectiveTargetClass} usa dado {hitDieInfo.die})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Opción 1: Media fija */}
              <button
                type="button"
                onClick={() => setHpMethod('average')}
                className={`p-3 rounded-sm border text-left transition flex flex-col justify-between ${
                  hpMethod === 'average'
                    ? 'bg-dnd-parchment border-dnd-gold shadow-md ring-1 ring-dnd-gold'
                    : 'bg-dnd-parchment-contrast border-dnd-border-antique hover:bg-dnd-parchment'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-dnd-title font-bold text-dnd-crimson text-xs">Media Fija</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-gold font-dnd-title">
                    Recomendado
                  </span>
                </div>
                <p className="text-[11px] text-dnd-ink-muted font-dnd-body mt-1">
                  {hitDieInfo.avgHp} + CON ({conMod}) ={' '}
                  <strong className="text-[#15803d] font-dnd-title font-bold">+{Math.max(1, hitDieInfo.avgHp + conMod)} PG</strong>
                </p>
                <div className="flex justify-end mt-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    hpMethod === 'average' ? 'border-dnd-gold bg-dnd-gold text-dnd-leather-dark' : 'border-dnd-border-antique'
                  }`}>
                    {hpMethod === 'average' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </button>

              {/* Opción 2: Tirar Dado Digital */}
              <button
                type="button"
                onClick={() => setHpMethod('roll')}
                className={`p-3 rounded-sm border text-left transition flex flex-col justify-between ${
                  hpMethod === 'roll'
                    ? 'bg-dnd-parchment border-dnd-gold shadow-md ring-1 ring-dnd-gold'
                    : 'bg-dnd-parchment-contrast border-dnd-border-antique hover:bg-dnd-parchment'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-dnd-title font-bold text-dnd-crimson text-xs flex items-center gap-1">
                    <Dices className="w-3.5 h-3.5 text-dnd-gold" />
                    Dado Digital
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink font-dnd-title">
                    {hitDieInfo.die}
                  </span>
                </div>
                <p className="text-[11px] text-dnd-ink-muted font-dnd-body mt-1">
                  Tirada virtual en app + CON ({conMod})
                </p>
                <div className="flex justify-end mt-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    hpMethod === 'roll' ? 'border-dnd-gold bg-dnd-gold text-dnd-leather-dark' : 'border-dnd-border-antique'
                  }`}>
                    {hpMethod === 'roll' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </button>

              {/* Opción 3: Tirada Física en Mesa */}
              <button
                type="button"
                onClick={() => setHpMethod('manual')}
                className={`p-3 rounded-sm border text-left transition flex flex-col justify-between ${
                  hpMethod === 'manual'
                    ? 'bg-dnd-parchment border-dnd-gold shadow-md ring-1 ring-dnd-gold'
                    : 'bg-dnd-parchment-contrast border-dnd-border-antique hover:bg-dnd-parchment'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-dnd-title font-bold text-dnd-crimson text-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-dnd-terracotta" />
                    Tiré en Mesa 🎲
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-[#15803d] font-dnd-title">
                    Físico
                  </span>
                </div>
                <p className="text-[11px] text-dnd-ink-muted mt-1 font-dnd-body">
                  Introduce el valor de tu dado físico
                </p>
                <div className="flex justify-end mt-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    hpMethod === 'manual' ? 'border-dnd-gold bg-dnd-gold text-dnd-leather-dark' : 'border-dnd-border-antique'
                  }`}>
                    {hpMethod === 'manual' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </button>
            </div>

            {/* Panel de tirada interactiva si eligió 'roll' */}
            {hpMethod === 'roll' && (
              <div className="p-4 rounded-sm bg-dnd-parchment-contrast border-2 border-dnd-border-antique flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isRolling}
                    onClick={handleRollDice}
                    className="px-4 py-2 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white font-dnd-title font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-50"
                  >
                    <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                    <span>{isRolling ? 'Tirando...' : `Lanzar 1${hitDieInfo.die}`}</span>
                  </button>
                  <div className="flex items-baseline gap-2">
                    <span className="text-dnd-ink-muted font-dnd-body text-xs">Resultado:</span>
                    <span className="text-xl font-dnd-title font-black text-dnd-crimson">
                      {rolledValue}
                    </span>
                    <span className="text-dnd-ink-muted text-xs font-dnd-body">en {hitDieInfo.die}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-dnd-ink font-dnd-body">
                    Ganancia final:{' '}
                    <strong className="text-[#15803d] font-dnd-title text-sm">
                      +{Math.max(1, rolledValue + conMod)} PG
                    </strong>{' '}
                    ({rolledValue} + CON {conMod})
                  </span>
                </div>
              </div>
            )}

            {/* Panel de tirada física en mesa si eligió 'manual' */}
            {hpMethod === 'manual' && (
              <div className="p-4 rounded-sm bg-dnd-parchment-contrast border-2 border-dnd-border-antique space-y-3 animate-in fade-in shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-dnd-title font-bold text-xs text-dnd-crimson uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-dnd-gold" />
                      Tirada Física en Mesa (Dado {hitDieInfo.die})
                    </span>
                    <p className="text-[11px] text-dnd-ink-muted font-dnd-body mt-0.5">
                      Tira tu dado físico en la mesa y selecciona o escribe el número obtenido:
                    </p>
                  </div>

                  {/* Selector rápido / botones numéricos */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Array.from({ length: hitDieInfo.dieValue }, (_, i) => i + 1).map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setManualTableDice(num)}
                        className={`w-7 h-7 rounded-md text-xs font-dnd-title font-bold transition flex items-center justify-center ${
                          manualTableDice === num
                            ? 'bg-dnd-crimson text-white shadow-sm ring-1 ring-dnd-gold'
                            : 'bg-dnd-parchment border border-dnd-border-antique text-dnd-ink hover:border-dnd-gold'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-dnd-border-antique flex items-center justify-between text-xs font-dnd-body">
                  <span className="text-dnd-ink-muted">
                    Dado en mesa: <strong className="text-dnd-crimson font-dnd-title">{manualTableDice}</strong> + Mod. CON: <strong className="text-dnd-ink font-dnd-title">{conMod}</strong>
                  </span>
                  <span className="text-xs text-dnd-ink font-dnd-body">
                    Total PG Ganados:{' '}
                    <strong className="text-[#15803d] font-dnd-title text-sm">
                      +{Math.max(1, manualTableDice + conMod)} PG Máximos
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* PASO 4: VISTA PREVIA INTERACTIVA ("MIRA, ASÍ QUEDARÍA TU PERSONAJE") */}
          <section className="space-y-4 pt-2 border-t border-dnd-border-antique">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-dnd-title font-bold text-base text-dnd-crimson uppercase tracking-wide flex items-center gap-2">
                  <Award className="w-5 h-5 text-dnd-gold" />
                  Vista Previa: Así quedaría tu héroe
                </h3>
                <p className="text-xs text-dnd-ink-muted font-dnd-body">
                  Comparativa de estadísticas antes y después de aplicar la subida de nivel
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted font-dnd-title">
                Simulación en tiempo real
              </span>
            </div>
            {/* TABLERO DE COMPARATIVA ANTES VS DESPUÉS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {/* Nivel Total */}
              <div className="p-3 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique space-y-1">
                <span className="text-[10px] text-dnd-ink-muted uppercase font-dnd-title font-bold block">Nivel Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-dnd-ink-subtle line-through font-dnd-title">{diff.totalLevel.before}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-dnd-gold shrink-0" />
                  <span className="text-lg font-dnd-title font-bold text-dnd-crimson">
                    {diff.totalLevel.after}
                  </span>
                </div>
              </div>

              {/* Clases / Multiclase */}
              <div className="p-3 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique space-y-1 col-span-2">
                <span className="text-[10px] text-dnd-ink-muted uppercase font-dnd-title font-bold block">Composición de Clases</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-dnd-ink-subtle line-through truncate max-w-[120px] font-dnd-title">{diff.classes.before}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-dnd-gold shrink-0" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-dnd-title">
                    {diff.classes.after}
                  </span>
                </div>
              </div>

              {/* Puntos de Golpe Máximos */}
              <div className="p-3 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique space-y-1">
                <span className="text-[10px] text-dnd-ink-muted uppercase font-dnd-title font-bold block">Puntos de Golpe (PG)</span>
                <div className="flex items-center gap-2">
                  <span className="text-dnd-ink-subtle line-through font-dnd-title">{diff.maxHp.before}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-dnd-crimson shrink-0" />
                  <span className="text-lg font-dnd-title font-bold text-emerald-700 dark:text-emerald-400">
                    {diff.maxHp.after}
                  </span>
                  <span className="text-[10px] font-dnd-title text-emerald-700 dark:text-emerald-400 font-bold">
                    (+{diff.maxHp.increase})
                  </span>
                </div>
              </div>

              {/* Dados de Golpe */}
              <div className="p-3 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique space-y-1">
                <span className="text-[10px] text-dnd-ink-muted uppercase font-dnd-title font-bold block">Dados de Golpe</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-dnd-ink-subtle line-through font-dnd-title">{diff.hitDice.before}</span>
                  <ArrowRight className="w-3 h-3 text-dnd-gold shrink-0" />
                  <span className="text-xs font-bold text-dnd-gold font-dnd-title">
                    {diff.hitDice.after}
                  </span>
                </div>
              </div>

              {/* Puntos de Experiencia Restantes */}
              <div className="p-3 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique space-y-1">
                <span className="text-[10px] text-dnd-ink-muted uppercase font-dnd-title font-bold block">PX Restantes</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-dnd-ink-subtle line-through font-dnd-title">{diff.experiencePoints.before.toLocaleString()}</span>
                  <ArrowRight className="w-3 h-3 text-dnd-gold shrink-0" />
                  <span className="text-xs font-bold text-dnd-crimson font-dnd-title">
                    {diff.experiencePoints.after.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bonificador de Competencia */}
              <div className="p-3 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique space-y-1">
                <span className="text-[10px] text-dnd-ink-muted uppercase font-dnd-title font-bold block">Competencia (PB)</span>
                <div className="flex items-center gap-2">
                  <span className="text-dnd-ink-muted font-dnd-title">+{diff.proficiencyBonus.before}</span>
                  {diff.proficiencyBonus.increased ? (
                    <>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-dnd-title">
                        +{diff.proficiencyBonus.after} (+1)
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-dnd-ink-subtle font-dnd-title">(Sin cambio)</span>
                  )}
                </div>
              </div>

              {/* Recursos de Clase Modificados (ej. Ki) */}
              {diff.resources.length > 0 && (
                <div className="p-3 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique space-y-1 col-span-2">
                  <span className="text-[10px] text-dnd-ink-muted uppercase font-dnd-title font-bold block">Recursos de Clase Actualizados</span>
                  <div className="space-y-1">
                    {diff.resources.map(res => (
                      <div key={res.name} className="flex items-center justify-between text-xs font-dnd-body">
                        <span className="text-dnd-crimson font-dnd-title font-bold">{res.name}:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-dnd-title font-bold">
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
              <span className="font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-dnd-gold" />
                Nuevos Rasgos Adquiridos en {effectiveTargetClass} Nivel {validation.targetClassNextLevel}
              </span>

              {newFeatures.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {newFeatures.map(feat => (
                    <div
                      key={feat.name}
                      className="p-3.5 rounded-sm bg-dnd-parchment border border-dnd-border-antique space-y-1.5 hover:border-dnd-gold transition shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-dnd-title font-bold text-sm text-dnd-crimson">
                          {feat.name}
                        </span>
                        {feat.type && (
                          <span className="text-[10px] px-2 py-0.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-dnd-ink-muted uppercase font-dnd-title">
                            {feat.type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-dnd-ink font-dnd-body leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-center text-xs text-dnd-ink-muted font-dnd-body">
                  Mejoras de dados de golpe, espacios de conjuro y avance general de clase para {effectiveTargetClass} nivel {validation.targetClassNextLevel}.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* PIE DE ACCIONES DEL MODAL */}
        <footer className="px-5 py-4 sm:px-6 sm:py-5 border-t-2 border-dnd-border-antique bg-dnd-parchment-dark flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs">
            {validation.canLevelUp ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-dnd-body font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Requisitos validados. Se deducirán {validation.xpCost.toLocaleString()} PX de tu personaje.
              </span>
            ) : (
              <span className="text-dnd-crimson font-dnd-body font-semibold flex items-center gap-1">
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
              className="px-4 py-2 rounded-sm border border-dnd-border-antique hover:bg-dnd-parchment-contrast text-dnd-ink-muted hover:text-dnd-ink font-dnd-title font-semibold text-xs transition uppercase tracking-wider"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={!validation.canLevelUp || readOnly || isApplying}
              onClick={handleConfirm}
              className={`px-5 py-2.5 rounded-md font-dnd-title font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md ${
                applySuccess
                  ? 'bg-emerald-700 text-white border border-emerald-500'
                  : validation.canLevelUp && !readOnly
                    ? 'bg-dnd-crimson hover:bg-dnd-crimson-hover text-white border border-dnd-gold active:scale-95 shadow-dnd-crimson/30'
                    : 'bg-dnd-parchment-contrast text-dnd-ink-subtle border border-dnd-border-antique cursor-not-allowed'
              }`}
            >
              {applySuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>¡Nivel Aplicado con Éxito!</span>
                </>
              ) : isApplying ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-dnd-gold" />
                  <span>Actualizando Personaje...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current text-dnd-gold" />
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
