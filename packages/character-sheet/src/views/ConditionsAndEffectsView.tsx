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
  type ActiveEffect,
  type StandardConditionId
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

const PRESET_BUFFS = [
  { name: 'Guía', type: 'buff' as const, description: '+1d4 a una prueba de característica.', duration: '1 minuto (Concentración)' },
  { name: 'Bendición', type: 'buff' as const, description: '+1d4 a todas las tiradas de ataque y de salvación.', duration: '1 minuto (Concentración)' },
  { name: 'Destello de Genialidad', type: 'buff' as const, description: '+4 a una tirada de salvación o prueba por Alizar Thorne.', duration: 'Instantáneo' },
  { name: 'Inspiración Bárdica (1d6)', type: 'buff' as const, description: 'Suma 1d6 a un ataque, salvación o habilidad por Zuma.', duration: '10 minutos' },
  { name: 'Escudo', type: 'buff' as const, description: '+5 a la CA e inmunidad a Proyectil mágico.', duration: '1 asalto' }
];

export function ConditionsAndEffectsView({
  character,
  readOnly = false,
  userRole = 'player',
  onApplyEffect,
  onRemoveEffect
}: BaseViewProps) {
  const activeEffects = character.active_effects || [];

  // Estado del tirador de heridas
  const [selectedTable, setSelectedTable] = useState<'A' | 'B'>('A');
  const [injuryRoll, setInjuryRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [showPhysicalEntry, setShowPhysicalEntry] = useState<boolean>(false);

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

  const handleApplyPresetBuff = (buff: typeof PRESET_BUFFS[0]) => {
    if (readOnly) return;
    const newEffect: ActiveEffect = {
      id: `buff-${Date.now()}`,
      name: buff.name,
      type: buff.type,
      description: buff.description,
      duration: buff.duration,
      applied_by: 'Compañero Aliado',
      created_at: new Date().toISOString()
    };
    onApplyEffect?.(newEffect);
  };

  // Obtener definición de la herida seleccionada para vista previa
  const tableData = selectedTable === 'A' ? TABLE_A_INJURIES : TABLE_B_INJURIES;
  const currentRolledDef = injuryRoll !== null
    ? tableData.find(d => injuryRoll >= d.minRoll && injuryRoll <= d.maxRoll)
    : null;

  return (
    <div className="space-y-6">
      {/* 1. Panel de Efectos Activos en el Personaje */}
      <div className="p-5 rounded-2xl bg-dnd-card border border-dnd-border space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-dnd-border/60 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <h3 className="font-fantasy font-bold text-sm text-slate-100 uppercase tracking-wide">
              Efectos, Condiciones y Heridas Activas ({activeEffects.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
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
                  className={`p-3.5 rounded-2xl border transition flex flex-col justify-between space-y-2.5 ${
                    isInjury
                      ? 'bg-red-950/20 border-red-700/60 shadow-md shadow-red-950/30'
                      : isBuff
                      ? 'bg-emerald-950/20 border-emerald-700/60'
                      : 'bg-dnd-surface border-amber-800/60'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          isInjury ? 'bg-red-500' : isBuff ? 'bg-emerald-400' : 'bg-amber-400'
                        }`} />
                        <span className="font-fantasy font-bold text-sm text-slate-100">
                          {effect.name}
                        </span>
                        {effect.injuryTable && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-red-950 border border-red-700 text-red-300">
                            Tabla {effect.injuryTable} ({effect.injuryRoll})
                          </span>
                        )}
                      </div>

                      {!readOnly && (
                        <button
                          onClick={() => onRemoveEffect?.(effect.id)}
                          className="text-slate-500 hover:text-red-400 transition p-1"
                          title="Retirar efecto de la ficha"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {effect.description}
                    </p>

                    {effect.treatment && (
                      <p className="text-[11px] text-amber-300/80 mt-1">
                        💊 <strong>Tratamiento / Recuperación:</strong> {effect.treatment}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-dnd-border/60 text-[10px] text-slate-500">
                    <span>Aplicado por: {effect.applied_by || 'Sistema'}</span>
                    {effect.duration && <span>Duración: {effect.duration}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
            ✨ El personaje no tiene ninguna condición, herida ni efecto negativo activo en este momento.
          </div>
        )}
      </div>

      {/* 2. Tirador Interactivo de Heridas de Combate (Tabla A y Tabla B) */}
      <div className="p-5 rounded-2xl bg-dnd-card border border-dnd-border space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-dnd-border/60 pb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500" />
            <h4 className="font-fantasy font-bold text-xs uppercase tracking-wider text-slate-200">
              Tirador de Heridas y Estrés de Combate (1d20 Oficial)
            </h4>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setSelectedTable('A'); setInjuryRoll(null); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                selectedTable === 'A'
                  ? 'bg-amber-950 border-amber-600 text-amber-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tabla A (Menores)
            </button>
            <button
              onClick={() => { setSelectedTable('B'); setInjuryRoll(null); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                selectedTable === 'B'
                  ? 'bg-red-950 border-red-600 text-red-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tabla B (Graves / 0 PG)
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          {selectedTable === 'A'
            ? 'Tabla A: Se activa tras un impacto único > 50% de PG o un golpe crítico que deje al personaje Malherido (< 50% PG).'
            : 'Tabla B: Se activa inmediatamente cuando el personaje cae a 0 PG o falla una salvación de muerte por 5 o más.'}
        </p>

        {/* Botones de Tirada: Digital o Físico en Mesa */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            disabled={isRolling || readOnly}
            onClick={handleRollInjury}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-950 to-amber-950 hover:from-red-900 hover:to-amber-900 border border-red-700/60 text-slate-100 text-xs font-fantasy font-bold flex items-center justify-center gap-2 shadow-md transition"
          >
            <Dices className={`w-4 h-4 text-dnd-gold ${isRolling ? 'animate-spin' : ''}`} />
            Tirar 1d20 Digital (Tabla {selectedTable})
          </button>

          <button
            disabled={readOnly}
            onClick={() => setShowPhysicalEntry(!showPhysicalEntry)}
            className={`px-4 py-2 rounded-xl border text-xs font-fantasy font-bold flex items-center justify-center gap-2 shadow-md transition ${
              showPhysicalEntry
                ? 'bg-amber-950 border-amber-500 text-amber-200 ring-1 ring-amber-400'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Tiré en Mesa (1d20 Físico) 🎲
          </button>
        </div>

        {/* Panel para ingresar d20 físico tirado en la mesa */}
        {showPhysicalEntry && !readOnly && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-700/60 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Selecciona lo que sacaste en tu d20 físico en la mesa:
              </span>
              <span className="text-[10px] text-slate-400">
                1 al 20
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setInjuryRoll(num)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center ${
                    injuryRoll === num
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-amber-600 hover:text-white'
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
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-red-950/30 border border-red-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-red-600 flex items-center justify-center font-fantasy font-extrabold text-xl text-red-400 shrink-0 shadow-md">
                {injuryRoll}
              </div>
              <div className="space-y-1">
                <span className="font-fantasy font-bold text-sm text-slate-100 block">
                  {currentRolledDef.name}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentRolledDef.description}
                </p>
                <span className="text-[11px] text-amber-300 block">
                  Tratamiento: {currentRolledDef.durationOrTreatment}
                </span>
              </div>
            </div>

            {!readOnly && (
              <button
                onClick={handleApplyRolledInjury}
                className="px-3.5 py-1.5 rounded-xl bg-red-900 hover:bg-red-800 border border-red-500 text-xs font-bold text-white shrink-0 transition"
              >
                Aplicar a mi Ficha
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Inyector Rápido de Condiciones Estándar de D&D (15 Condiciones) */}
      <div className="p-5 rounded-2xl bg-dnd-card border border-dnd-border space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-dnd-border/60 pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h4 className="font-fantasy font-bold text-xs uppercase tracking-wider text-slate-200">
              Glosario de Condiciones Estándar (Activar / Desactivar)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">1 clic para aplicar</span>
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
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between space-y-1 ${
                  isActive
                    ? 'bg-red-950/80 border-red-500 text-red-200 ring-1 ring-red-500 shadow-md'
                    : 'bg-dnd-surface border-dnd-border text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
                title={cond.description}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold capitalize">{cond.name}</span>
                  {isActive && <span className="text-[10px] font-bold text-red-400">ACTIVO</span>}
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2">
                  {cond.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Inyector Rápido de Buffs de Compañeros Aliados */}
      <div className="p-5 rounded-2xl bg-dnd-card border border-dnd-border space-y-3 shadow-md">
        <div className="flex items-center gap-2 border-b border-dnd-border/60 pb-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h4 className="font-fantasy font-bold text-xs uppercase tracking-wider text-slate-200">
            Inyección de Buffs de la Compañía (Soporte Táctico de Aliados)
          </h4>
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-1">
          {PRESET_BUFFS.map(buff => (
            <button
              key={buff.name}
              type="button"
              disabled={readOnly}
              onClick={() => handleApplyPresetBuff(buff)}
              className="px-3 py-1.5 rounded-xl bg-dnd-surface hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-600 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition"
              title={buff.description}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>{buff.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
