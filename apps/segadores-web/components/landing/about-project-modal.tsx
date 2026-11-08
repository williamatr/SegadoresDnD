'use client';

import React, { useEffect } from 'react';
import { X, Shield, BookOpen, Code2, Heart, ExternalLink, Sparkles } from 'lucide-react';

interface AboutProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutProjectModal({ isOpen, onClose }: AboutProjectModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-dnd-card border border-dnd-border rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="flex items-start justify-between border-b border-dnd-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dnd-gold to-amber-700 flex items-center justify-center text-slate-950 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-title" className="text-xl font-bold text-slate-100 font-fantasy">
                Acerca de SegadoresDnD
              </h3>
              <p className="text-xs text-dnd-gold-light uppercase tracking-wider">
                Filosofía de Desarrollo &bull; D&D 5.5e
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-dnd-surface transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Origen de la Campaña */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-dnd-gold">
            <Heart className="w-4 h-4 text-red-400" />
            <span>El Origen en la Mesa de Juego</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Este proyecto nace directamente de las partidas reales de la campaña <strong className="text-slate-100">Segadores de Orcos</strong>, dirigida por <strong className="text-slate-100">William Tovar</strong>. El objetivo principal es ofrecer a los jugadores una consola táctica fluida que resuelva la complejidad del combate en tiempo real: cálculo dinámico de heridas (Tablas A y B con d20), gestión de espacios de conjuro, economía de acciones y filtrado estricto anti-metajuego entre el Máster y los aventureros.
          </p>
        </div>

        {/* Doble Licencia */}
        <div className="p-4 rounded-xl bg-dnd-surface border border-dnd-border/80 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <BookOpen className="w-4 h-4 text-dnd-gold" />
            <span>Licenciamiento Dual y Propiedad Intelectual</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-dnd-gold font-bold">&bull;</span>
              <span>
                <strong className="text-slate-100">Código Fuente (Licencia MIT):</strong> Toda la infraestructura web, componentes React, motor matemático en TypeScript y estilos son software libre y de código abierto.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dnd-gold font-bold">&bull;</span>
              <span>
                <strong className="text-slate-100">Reglas de D&D (Licencia CC-BY-4.0):</strong> Los hechizos, reglas y estadísticas derivan del <strong className="text-slate-100">System Reference Document 5.1 / 5.2.1</strong> (&ldquo;SRD&rdquo;) publicado por Wizards of the Coast LLC. Las notas privadas de la campaña permanecen aisladas en bóvedas protegidas.
              </span>
            </li>
          </ul>
        </div>

        {/* Arquitectura Tecnológica */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-dnd-gold">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>Arquitectura Monorepo y Modularidad</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Construido con <strong className="text-slate-200">Next.js 14 App Router</strong>, <strong className="text-slate-200">Tailwind CSS</strong>, <strong className="text-slate-200">Turborepo</strong> y librerías desacopladas puras:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-amber-400 font-mono font-medium">@segadores/dnd-core</span>
              <p className="text-[11px] text-slate-400 mt-1">Lógica matemática pura, fórmulas D&D 5.5e y evaluador de estados.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-amber-400 font-mono font-medium">@segadores/obsidian-engine</span>
              <p className="text-[11px] text-slate-400 mt-1">Parser de Markdown, callouts estilizados y filtro anti-metajuego.</p>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="pt-3 border-t border-dnd-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <a
            href="https://github.com/williamatr/SegadoresDnD"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-dnd-gold hover:underline"
          >
            Repositorio Oficial en GitHub <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-dnd-surface border border-dnd-border hover:bg-slate-800 text-slate-200 font-medium transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
