'use client';

import React, { useState } from 'react';
import { ExternalLink, Shield, BookOpen } from 'lucide-react';
import { TaperedRule } from '@segadores/ui';
import { AboutProjectModal } from '../landing/about-project-modal';

export function Footer() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <footer className="mt-20 pt-8 pb-14 text-xs text-[#a89b88] space-y-5 max-w-6xl mx-auto px-4 sm:px-6">
        <TaperedRule variant="gold" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            <span className="font-dnd-title text-[#fdf6ea] font-bold text-sm tracking-wider">
              SegadoresDnD
            </span>
            <span className="text-[#c29b38]">&bull;</span>
            <p className="font-dnd-body text-[#d4c2a5]">
              Mesa de campaña de <strong className="text-[#fdf6ea] font-semibold">William Tovar</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-dnd-title tracking-wider uppercase">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-[#c29b38] transition text-[#d4c2a5]"
            >
              Acerca del Proyecto
            </button>
            <span className="text-[#58544d]">&bull;</span>
            <a
              href="https://github.com/williamatr/SegadoresDnD"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#c29b38] flex items-center gap-1 transition text-[#d4c2a5]"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[#58544d]">&bull;</span>
            <span className="text-[#a89b88]">Licencia MIT</span>
          </div>
        </div>

        {/* Nota canónica de atribución legal SRD 5.1 / 5.2.1 CC-BY-4.0 */}
        <p className="text-[11px] text-[#8a7f72] font-dnd-body leading-relaxed text-center sm:text-left border-t border-[#c29b38]/20 pt-3">
          Las reglas y mecánicas de juego derivan del <em>System Reference Document 5.1 / 5.2.1 (&ldquo;SRD&rdquo;)</em> publicado por Wizards of the Coast LLC bajo licencia Creative Commons Attribution 4.0 International (CC-BY-4.0). Dungeons & Dragons es marca comercial registrada de Wizards of the Coast LLC.
        </p>
      </footer>

      <AboutProjectModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
