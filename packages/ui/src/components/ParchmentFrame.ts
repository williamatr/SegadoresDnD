import React from 'react';

export interface ParchmentFrameProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'page' | 'card' | 'callout' | 'leather';
  notched?: boolean;
}

/**
 * ParchmentFrame: Marco de pergamino táctil inspirado en los manuales de D&D.
 * Admite bordes biselados (notched corners), fondo envejecido y relieve de hoja física.
 */
export function ParchmentFrame({
  children,
  className = '',
  variant = 'card',
  notched = false,
}: ParchmentFrameProps) {
  let variantStyles = 'bg-dnd-parchment text-dnd-ink border-dnd-border-antique shadow-sm';

  if (variant === 'page') {
    variantStyles =
      'bg-dnd-parchment text-dnd-ink border-dnd-border-strong shadow-lg p-6 sm:p-8';
  } else if (variant === 'callout') {
    variantStyles =
      'bg-dnd-parchment-contrast text-dnd-ink border-l-4 border-l-dnd-crimson border-dnd-border-antique p-4';
  } else if (variant === 'leather') {
    variantStyles =
      'bg-dnd-leather text-dnd-parchment border-dnd-gold shadow-xl p-6';
  }

  const notchedClass = notched ? 'dnd-notched rounded-lg' : 'rounded-lg';

  return React.createElement(
    'div',
    {
      className: `relative border border-opacity-90 transition-all ${variantStyles} ${notchedClass} ${className}`,
    },
    children
  );
}
