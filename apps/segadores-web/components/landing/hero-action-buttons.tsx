'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Dices, Info } from 'lucide-react';
import { AboutProjectModal } from './about-project-modal';

export function HeroActionButtons() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 font-dnd-title">
        <Link
          href="/portal"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-dnd-crimson hover:bg-dnd-crimson-hover text-white border border-dnd-gold font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition active:scale-95"
        >
          <Shield className="w-4 h-4 text-dnd-gold" />
          Ingresar al Portal
        </Link>

        <Link
          href="/demo"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique hover:border-dnd-gold text-dnd-crimson font-bold text-xs uppercase tracking-wider transition shadow-xs active:scale-95"
        >
          <Dices className="w-4 h-4 text-dnd-terracotta" />
          Explorar Demo (12 Clases)
        </Link>

        <button
          type="button"
          onClick={() => setIsAboutOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-dnd-parchment-contrast hover:bg-dnd-parchment border border-dnd-border-antique text-dnd-ink-muted hover:text-dnd-ink font-bold text-xs uppercase tracking-wider transition shadow-xs"
        >
          <Info className="w-4 h-4 text-dnd-gold" />
          Acerca de la Compañía
        </button>
      </div>

      <AboutProjectModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
