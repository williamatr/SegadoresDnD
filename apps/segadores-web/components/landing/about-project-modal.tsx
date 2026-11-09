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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-dnd-parchment text-dnd-ink border-2 border-dnd-border-antique dnd-notched shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="flex items-start justify-between border-b border-dnd-border-antique pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-dnd-crimson border border-dnd-gold flex items-center justify-center text-dnd-gold shadow-md">
              <Shield className="w-5 h-5 text-dnd-gold" />
            </div>
            <div>
              <h3 id="modal-title" className="text-xl font-bold text-dnd-crimson font-dnd-title uppercase tracking-wide">
                Acerca de SegadoresDnD
              </h3>
              <p className="text-xs text-dnd-terracotta font-dnd-title font-semibold uppercase tracking-wider">
                Filosofía de Desarrollo &bull; D&D 5.5e
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-sm text-dnd-ink-muted hover:text-dnd-ink hover:bg-dnd-parchment-contrast transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Origen de la Campaña */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-dnd-crimson font-dnd-title uppercase tracking-wide">
            <Heart className="w-4 h-4 text-dnd-crimson fill-dnd-crimson" />
            <span>El Origen en la Mesa de Juego</span>
          </div>
          <p className="text-sm text-dnd-ink-muted font-dnd-body leading-relaxed">
            Este proyecto nace directamente de las partidas reales de la campaña <strong className="text-dnd-ink font-dnd-title">Segadores de Orcos</strong>, dirigida por <strong className="text-dnd-ink font-dnd-title">William Tovar</strong>. El objetivo principal es ofrecer a los jugadores una consola táctica fluida que resuelva la complejidad del combate en tiempo real: cálculo dinámico de heridas (Tablas A y B con d20), gestión de espacios de conjuro, economía de acciones y filtrado estricto anti-metajuego entre el Máster y los aventureros.
          </p>
        </div>

        {/* Doble Licencia */}
        <div className="p-4 rounded-sm bg-dnd-parchment-dark border border-dnd-border-antique space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-dnd-crimson font-dnd-title uppercase tracking-wide">
            <BookOpen className="w-4 h-4 text-dnd-gold" />
            <span>Licenciamiento Dual y Propiedad Intelectual</span>
          </div>
          <ul className="text-xs text-dnd-ink font-dnd-body space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-dnd-gold font-bold">&bull;</span>
              <span>
                <strong className="text-dnd-crimson font-dnd-title">Código Fuente (Licencia MIT):</strong> Toda la infraestructura web, componentes React, motor matemático en TypeScript y estilos son software libre y de código abierto.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dnd-gold font-bold">&bull;</span>
              <span>
                <strong className="text-dnd-crimson font-dnd-title">Reglas de D&D (Licencia CC-BY-4.0):</strong> Los hechizos, reglas y estadísticas derivan del <strong className="text-dnd-ink font-dnd-title">System Reference Document 5.1 / 5.2.1</strong> (&ldquo;SRD&rdquo;) publicado por Wizards of the Coast LLC. Las notas privadas de la campaña permanecen aisladas en bóvedas protegidas.
              </span>
            </li>
          </ul>
        </div>

        {/* Arquitectura Tecnológica */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-dnd-crimson font-dnd-title uppercase tracking-wide">
            <Code2 className="w-4 h-4 text-dnd-gold" />
            <span>Arquitectura Monorepo y Modularidad</span>
          </div>
          <p className="text-xs text-dnd-ink-muted font-dnd-body leading-relaxed">
            Construido con <strong className="text-dnd-ink font-dnd-title">Next.js 14 App Router</strong>, <strong className="text-dnd-ink font-dnd-title">Tailwind CSS</strong>, <strong className="text-dnd-ink font-dnd-title">Turborepo</strong> y librerías desacopladas puras:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique">
              <span className="text-dnd-crimson font-dnd-title font-bold">@segadores/dnd-core</span>
              <p className="text-[11px] text-dnd-ink-muted font-dnd-body mt-1">Lógica matemática pura, fórmulas D&D 5.5e y evaluador de estados.</p>
            </div>
            <div className="p-2.5 rounded-sm bg-dnd-parchment-contrast border border-dnd-border-antique">
              <span className="text-dnd-crimson font-dnd-title font-bold">@segadores/obsidian-engine</span>
              <p className="text-[11px] text-dnd-ink-muted font-dnd-body mt-1">Parser de Markdown, callouts estilizados y filtro anti-metajuego.</p>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="pt-3 border-t border-dnd-border-antique flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-dnd-ink-muted">
          <a
            href="https://github.com/williamatr/SegadoresDnD"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-dnd-crimson hover:text-dnd-gold font-dnd-title font-bold uppercase tracking-wider hover:underline"
          >
            Repositorio Oficial en GitHub <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white font-dnd-title font-bold uppercase tracking-wider transition shadow-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
