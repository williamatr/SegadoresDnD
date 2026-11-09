import React, { useState } from 'react';
import {
  Scroll,
  User,
  Heart,
  Shield,
  Compass,
  Sparkles,
  Edit3,
  Check,
  Save,
  MessageSquare
} from 'lucide-react';
import type { BaseViewProps } from '../types.ts';
import type { CharacterPersonality } from '@segadores/dnd-core';

export function LoreAndChronicleView({
  character,
  readOnly = false,
  onUpdatePersonalityField,
  onUpdatePlayerNotes
}: BaseViewProps) {
  const [editingField, setEditingField] = useState<keyof CharacterPersonality | null>(null);
  const [fieldValue, setFieldValue] = useState<string>('');
  const [notes, setNotes] = useState<string>(character.player_notes || '');
  const [notesSaved, setNotesSaved] = useState<boolean>(false);

  const pers = character.personality || {
    traits: '',
    ideals: '',
    bonds: '',
    flaws: ''
  };

  const handleStartEdit = (field: keyof CharacterPersonality, currentVal: string) => {
    if (readOnly) return;
    setEditingField(field);
    setFieldValue(currentVal);
  };

  const handleSaveField = (field: keyof CharacterPersonality) => {
    onUpdatePersonalityField?.(field, fieldValue);
    setEditingField(null);
  };

  const handleSaveNotes = () => {
    if (readOnly) return;
    onUpdatePlayerNotes?.(notes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Identidad Narrativa: Trasfondo, Raza, Alineamiento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-1 shadow-md">
          <span className="text-[11px] font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider block">
            Trasfondo Formal
          </span>
          <p className="font-dnd-title font-bold text-base text-dnd-ink">
            {character.background || 'Aventurero'}
          </p>
          <span className="text-[10px] text-dnd-ink-muted font-dnd-body block">Competencias y conexiones previas</span>
        </div>

        <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-1 shadow-md">
          <span className="text-[11px] font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider block">
            Alineamiento Moral
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`font-dnd-title font-bold text-base ${
                character.alignment.toLowerCase().includes('pendiente')
                  ? 'text-dnd-terracotta italic'
                  : 'text-dnd-crimson'
              }`}
            >
              {character.alignment || 'Pendiente'}
            </span>
          </div>
          <span className="text-[10px] text-dnd-ink-muted font-dnd-body block">Compás ético del aventurero</span>
        </div>

        <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-1 shadow-md">
          <span className="text-[11px] font-dnd-title font-bold text-dnd-crimson uppercase tracking-wider block">
            Raza y Linaje
          </span>
          <p className="font-dnd-title font-bold text-base text-dnd-ink">
            {character.race}
          </p>
          <span className="text-[10px] text-dnd-ink-muted font-dnd-body block">Rasgos fisiológicos e idiomas</span>
        </div>
      </div>

      {/* 2. Personalidad, Ideales, Vínculos y Defectos (Con soporte especial de placeholders interactivos para Solaria) */}
      <div className="p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
          <div className="flex items-center gap-2">
            <Scroll className="w-4 h-4 text-dnd-gold" />
            <h3 className="font-dnd-title font-bold text-sm text-dnd-crimson tracking-wide uppercase">
              Pilares de Personalidad y Rol
            </h3>
          </div>
          <span className="text-[11px] text-dnd-ink-muted font-dnd-title">
            {!readOnly ? 'Haz clic en cualquier campo para editar' : 'Modo lectura'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rasgos de Personalidad */}
          <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-dnd-crimson flex items-center gap-1.5 uppercase font-dnd-title">
                <User className="w-3.5 h-3.5 text-dnd-gold" />
                Rasgos de Personalidad
              </span>
              {!readOnly && editingField !== 'traits' && (
                <button
                  onClick={() => handleStartEdit('traits', pers.traits)}
                  className="text-dnd-ink-muted hover:text-dnd-gold transition p-1"
                  title="Editar rasgo"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>

            {editingField === 'traits' ? (
              <div className="space-y-2 pt-1">
                <textarea
                  rows={3}
                  value={fieldValue}
                  onChange={e => setFieldValue(e.target.value)}
                  className="w-full p-2 rounded-sm bg-dnd-parchment-contrast border border-dnd-gold text-xs text-dnd-ink focus:outline-none font-dnd-body"
                  placeholder="Describe los hábitos, manías o templanza de tu héroe..."
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-2.5 py-1 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-[11px] text-dnd-ink-muted hover:text-dnd-ink font-dnd-title uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSaveField('traits')}
                    className="px-2.5 py-1 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white text-xs font-dnd-title font-bold uppercase tracking-wider shadow-sm"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : pers.traits ? (
              <p className="text-xs text-dnd-ink font-dnd-body italic leading-relaxed">
                "{pers.traits}"
              </p>
            ) : (
              <button
                onClick={() => handleStartEdit('traits', '')}
                className="p-3 rounded-sm border border-dashed border-dnd-gold bg-dnd-gold-surface text-left text-xs text-dnd-gold hover:border-dnd-gold font-dnd-body transition"
              >
                ✨ <strong className="font-semibold">Pendiente de completar por la jugadora.</strong> Haz clic aquí para añadir los rasgos de personalidad...
              </button>
            )}
          </div>

          {/* Ideales */}
          <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-dnd-crimson flex items-center gap-1.5 uppercase font-dnd-title">
                <Compass className="w-3.5 h-3.5 text-dnd-gold" />
                Ideales
              </span>
              {!readOnly && editingField !== 'ideals' && (
                <button
                  onClick={() => handleStartEdit('ideals', pers.ideals)}
                  className="text-dnd-ink-muted hover:text-dnd-gold transition p-1"
                  title="Editar ideal"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>

            {editingField === 'ideals' ? (
              <div className="space-y-2 pt-1">
                <textarea
                  rows={3}
                  value={fieldValue}
                  onChange={e => setFieldValue(e.target.value)}
                  className="w-full p-2 rounded-sm bg-dnd-parchment-contrast border border-dnd-gold text-xs text-dnd-ink focus:outline-none font-dnd-body"
                  placeholder="¿En qué cree tu héroe por encima de todo? (Justicia, Belleza, Razón, Deber)..."
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-2.5 py-1 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-[11px] text-dnd-ink-muted hover:text-dnd-ink font-dnd-title uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSaveField('ideals')}
                    className="px-2.5 py-1 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white text-xs font-dnd-title font-bold uppercase tracking-wider shadow-sm"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : pers.ideals ? (
              <p className="text-xs text-dnd-ink font-dnd-body italic leading-relaxed">
                "{pers.ideals}"
              </p>
            ) : (
              <button
                onClick={() => handleStartEdit('ideals', '')}
                className="p-3 rounded-sm border border-dashed border-dnd-gold bg-dnd-gold-surface text-left text-xs text-dnd-gold hover:border-dnd-gold font-dnd-body transition"
              >
                ✨ <strong className="font-semibold">Pendiente de completar por la jugadora.</strong> Haz clic aquí para añadir sus ideales...
              </button>
            )}
          </div>

          {/* Vínculos */}
          <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-dnd-crimson flex items-center gap-1.5 uppercase font-dnd-title">
                <Heart className="w-3.5 h-3.5 text-dnd-crimson fill-dnd-crimson" />
                Vínculos
              </span>
              {!readOnly && editingField !== 'bonds' && (
                <button
                  onClick={() => handleStartEdit('bonds', pers.bonds)}
                  className="text-dnd-ink-muted hover:text-dnd-gold transition p-1"
                  title="Editar vínculo"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>

            {editingField === 'bonds' ? (
              <div className="space-y-2 pt-1">
                <textarea
                  rows={3}
                  value={fieldValue}
                  onChange={e => setFieldValue(e.target.value)}
                  className="w-full p-2 rounded-sm bg-dnd-parchment-contrast border border-dnd-gold text-xs text-dnd-ink focus:outline-none font-dnd-body"
                  placeholder="¿A quién o a qué le guardas fidelidad inquebrantable?..."
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-2.5 py-1 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-[11px] text-dnd-ink-muted hover:text-dnd-ink font-dnd-title uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSaveField('bonds')}
                    className="px-2.5 py-1 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white text-xs font-dnd-title font-bold uppercase tracking-wider shadow-sm"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : pers.bonds ? (
              <p className="text-xs text-dnd-ink font-dnd-body italic leading-relaxed">
                "{pers.bonds}"
              </p>
            ) : (
              <button
                onClick={() => handleStartEdit('bonds', '')}
                className="p-3 rounded-sm border border-dashed border-dnd-gold bg-dnd-gold-surface text-left text-xs text-dnd-gold hover:border-dnd-gold font-dnd-body transition"
              >
                ✨ <strong className="font-semibold">Pendiente de completar por la jugadora.</strong> Haz clic aquí para añadir sus vínculos...
              </button>
            )}
          </div>

          {/* Defectos */}
          <div className="p-4 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-dnd-crimson flex items-center gap-1.5 uppercase font-dnd-title">
                <Shield className="w-3.5 h-3.5 text-dnd-gold" />
                Defectos
              </span>
              {!readOnly && editingField !== 'flaws' && (
                <button
                  onClick={() => handleStartEdit('flaws', pers.flaws)}
                  className="text-dnd-ink-muted hover:text-dnd-gold transition p-1"
                  title="Editar defecto"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>

            {editingField === 'flaws' ? (
              <div className="space-y-2 pt-1">
                <textarea
                  rows={3}
                  value={fieldValue}
                  onChange={e => setFieldValue(e.target.value)}
                  className="w-full p-2 rounded-sm bg-dnd-parchment-contrast border border-dnd-gold text-xs text-dnd-ink focus:outline-none font-dnd-body"
                  placeholder="¿Cuál es la debilidad moral o tentación secreta de tu héroe?..."
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-2.5 py-1 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique text-[11px] text-dnd-ink-muted hover:text-dnd-ink font-dnd-title uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSaveField('flaws')}
                    className="px-2.5 py-1 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white text-xs font-dnd-title font-bold uppercase tracking-wider shadow-sm"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : pers.flaws ? (
              <p className="text-xs text-dnd-ink font-dnd-body italic leading-relaxed">
                "{pers.flaws}"
              </p>
            ) : (
              <button
                onClick={() => handleStartEdit('flaws', '')}
                className="p-3 rounded-sm border border-dashed border-dnd-gold bg-dnd-gold-surface text-left text-xs text-dnd-gold hover:border-dnd-gold font-dnd-body transition"
              >
                ✨ <strong className="font-semibold">Pendiente de completar por la jugadora.</strong> Haz clic aquí para añadir sus defectos...
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Apariencia Física e Historia de Origen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Apariencia */}
        <div className="p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2.5 shadow-md">
          <div className="flex items-center gap-2 border-b border-dnd-border-antique/80 pb-2">
            <User className="w-4 h-4 text-dnd-gold" />
            <h4 className="font-dnd-title font-bold text-xs uppercase tracking-wider text-dnd-crimson">
              Apariencia Física y Porte
            </h4>
          </div>
          <p className="text-xs text-dnd-ink font-dnd-body leading-relaxed">
            {character.appearance || 'Sin descripción visual registrada.'}
          </p>
        </div>

        {/* Backstory */}
        <div className="p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-2.5 shadow-md">
          <div className="flex items-center gap-2 border-b border-dnd-border-antique/80 pb-2">
            <Scroll className="w-4 h-4 text-dnd-gold" />
            <h4 className="font-dnd-title font-bold text-xs uppercase tracking-wider text-dnd-crimson">
              Crónica de Origen & Pasado
            </h4>
          </div>
          <p className="text-xs text-dnd-ink font-dnd-body leading-relaxed">
            {character.backstory || 'Sin crónica de origen registrada.'}
          </p>
        </div>
      </div>

      {/* 4. Notas de Sesión del Jugador (`player_notes`) */}
      <div className="p-5 rounded-sm bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-dnd-border-antique/80 pb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-dnd-gold" />
            <h4 className="font-dnd-title font-bold text-xs uppercase tracking-wider text-dnd-crimson">
              Cuaderno de Notas del Jugador (Sesión en Vivo)
            </h4>
          </div>
          {notesSaved && (
            <span className="text-[11px] font-dnd-title font-bold text-[#15803d] flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> ¡Notas guardadas!
            </span>
          )}
        </div>

        <textarea
          rows={5}
          disabled={readOnly}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Anota aquí pistas de la campaña, nombres de PNJ, deudas pendientes o acuerdos con tus compañeros de Segadores..."
          className="w-full p-3 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique text-xs text-dnd-ink placeholder:text-dnd-ink-subtle font-dnd-body focus:outline-none focus:border-dnd-gold"
        />

        {!readOnly && (
          <div className="flex items-center justify-end">
            <button
              onClick={handleSaveNotes}
              className="px-4 py-2 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover border border-dnd-gold text-white text-xs font-dnd-title font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-sm"
            >
              <Save className="w-3.5 h-3.5 text-dnd-gold" />
              Guardar Notas de Campaña
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
