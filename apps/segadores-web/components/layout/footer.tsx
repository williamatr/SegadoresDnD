'use client';

import React, { useState } from 'react';
import { ExternalLink, Shield, BookOpen } from 'lucide-react';
import { TaperedRule } from '@segadores/ui';
import { AboutProjectModal } from '../landing/about-project-modal';

export function Footer() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <footer className="mt-20 pt-8 pb-14 text-xs text-dnd-ink-muted space-y-5 max-w-6xl mx-auto px-4 sm:px-6">
        <TaperedRule variant="gold" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            <span className="font-dnd-title text-dnd-ink font-bold text-sm tracking-wider">
              SegadoresDnD
            </span>
            <span className="text-dnd-gold">&bull;</span>
            <p className="font-dnd-body text-dnd-ink-muted">
              Mesa de campaña de <strong className="text-dnd-ink font-semibold">William Tovar</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-dnd-title tracking-wider uppercase">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-dnd-crimson transition text-dnd-ink-muted"
            >
              Acerca del Proyecto
            </button>
            <span className="text-dnd-border-antique">&bull;</span>
            <a
              href="https://github.com/williamatr/SegadoresDnD"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-dnd-crimson flex items-center gap-1 transition text-dnd-ink-muted"
            >
              GitHub <ExternalLink className="w-3 h-3 text-dnd-gold" />
            </a>
            <span className="text-dnd-border-antique">&bull;</span>
            <span className="text-dnd-ink-subtle">Licencia MIT</span>
          </div>
        </div>

        {/* Nota canónica de atribución legal SRD 5.1 / 5.2.1 CC-BY-4.0 */}
        <p className="text-[11px] text-dnd-ink-subtle font-dnd-body leading-relaxed text-center sm:text-left border-t border-dnd-border-antique pt-3">
          Las reglas y mecánicas de juego derivan del <em>System Reference Document 5.1 / 5.2.1 (&ldquo;SRD&rdquo;)</em> publicado por Wizards of the Coast LLC bajo licencia Creative Commons Attribution 4.0 International (CC-BY-4.0). Dungeons & Dragons es marca comercial registrada de Wizards of the Coast LLC.
        </p>
      </footer>

      <AboutProjectModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
