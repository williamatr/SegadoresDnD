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
  let variantStyles = 'bg-[#fdf6ea] text-[#242528] border-[#d4c2a5] shadow-md';

  if (variant === 'page') {
    variantStyles =
      'bg-[#fdf6ea] text-[#242528] border-[#c4b192] shadow-xl p-6 sm:p-8';
  } else if (variant === 'callout') {
    variantStyles =
      'bg-[#ede2cb] text-[#242528] border-l-4 border-l-[#58180D] border-[#d4c2a5] p-4';
  } else if (variant === 'leather') {
    variantStyles =
      'bg-[#2c1e18] text-[#fdf6ea] border-[#c29b38] shadow-2xl p-6';
  }

  const notchedClass = notched ? 'dnd-notched' : 'rounded-sm';

  const innerBorder =
    !notched && variant !== 'leather'
      ? React.createElement('div', {
          className:
            'absolute inset-0 pointer-events-none border border-[#d4c2a5]/40 m-1 rounded-sm',
        })
      : null;

  return React.createElement(
    'div',
    {
      className: `relative border border-opacity-80 transition-all ${variantStyles} ${notchedClass} ${className}`,
      style: {
        boxShadow:
          variant !== 'leather'
            ? '0 1px 3px rgba(0,0,0,0.1), inset 0 0 30px rgba(196,177,146,0.2)'
            : '0 4px 15px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.8)',
      },
    },
    innerBorder,
    children
  );
}
