'use client';

import React, { useState } from 'react';
import { ExternalLink, Shield, Heart } from 'lucide-react';
import { AboutProjectModal } from '../landing/about-project-modal';

export function Footer() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-dnd-border bg-dnd-dark/50 pt-8 pb-12 mt-16 text-xs text-slate-500 space-y-4 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-fantasy text-slate-300 font-bold">SegadoresDnD</span>
            <span>&bull;</span>
            <p>
              Creado para la mesa de <span className="text-slate-300 font-medium">William Tovar</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-dnd-gold transition text-slate-400"
            >
              Acerca del Proyecto
            </button>
            <span className="text-slate-700">&bull;</span>
            <a
              href="https://github.com/williamatr/SegadoresDnD"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-dnd-gold flex items-center gap-1 transition"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">&bull;</span>
            <span className="text-slate-400">Licencia MIT</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed text-center sm:text-left">
          Las reglas y mecánicas de juego derivan del <em>System Reference Document 5.1 / 5.2.1 (&ldquo;SRD&rdquo;)</em> publicado por Wizards of the Coast LLC bajo licencia Creative Commons Attribution 4.0 International (CC-BY-4.0). Dungeons & Dragons es marca comercial registrada de Wizards of the Coast.
        </p>
      </footer>

      <AboutProjectModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
