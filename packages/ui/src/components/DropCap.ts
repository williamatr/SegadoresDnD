import React from 'react';

export interface DropCapProps {
  letter: string;
  className?: string;
  variant?: 'gold' | 'crimson' | 'ink';
}

/**
 * DropCap: Letra capitular iluminada de 2-3 líneas de alto.
 * Utilizada al inicio de capítulos y descripciones canónicas en manuales de D&D.
 */
export function DropCap({ letter, className = '', variant = 'gold' }: DropCapProps) {
  let colorStyle = 'text-[#c29b38] border-[#c29b38]/40 bg-[#f4ebe1]';

  if (variant === 'crimson') {
    colorStyle = 'text-[#58180D] border-[#58180D]/40 bg-[#ede2cb]';
  } else if (variant === 'ink') {
    colorStyle = 'text-[#242528] border-[#242528]/40 bg-[#fdf6ea]';
  }

  return React.createElement(
    'span',
    {
      className: `float-left text-4xl sm:text-5xl font-dnd-title font-bold leading-none mr-3 mt-1 px-2.5 py-1.5 border rounded-sm shadow-sm select-none ${colorStyle} ${className}`,
      style: {
        textShadow: '1px 1px 0px rgba(0,0,0,0.15)',
      },
    },
    letter.toUpperCase()
  );
}
