import React from 'react';

export interface TaperedRuleProps {
  className?: string;
  variant?: 'crimson' | 'gold' | 'ink';
}

/**
 * TaperedRule: La clásica línea divisoria cónica de los manuales de D&D 5e.
 * Gruesa en el centro (forma de diamante/rombo alargado) y afilada en los extremos.
 */
export function TaperedRule({ className = '', variant = 'crimson' }: TaperedRuleProps) {
  const gradientId = `tapered-grad-${variant}`;

  let stopColor = '#58180D';
  if (variant === 'gold') stopColor = '#c29b38';
  if (variant === 'ink') stopColor = '#242528';

  const stops = [
    React.createElement('stop', { key: '1', offset: '0%', stopColor, stopOpacity: '0' }),
    React.createElement('stop', { key: '2', offset: '50%', stopColor, stopOpacity: '1' }),
    React.createElement('stop', { key: '3', offset: '100%', stopColor, stopOpacity: '0' }),
  ];

  const defs = React.createElement(
    'defs',
    null,
    React.createElement(
      'linearGradient',
      { id: gradientId, x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
      stops
    )
  );

  const polygon = React.createElement('polygon', {
    points: '0,4 250,1 500,4 250,7',
    fill: `url(#${gradientId})`,
  });

  const svg = React.createElement(
    'svg',
    {
      viewBox: '0 0 500 8',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      className: 'w-full max-w-full h-2 overflow-visible',
      preserveAspectRatio: 'none',
    },
    defs,
    polygon
  );

  return React.createElement(
    'div',
    { className: `w-full flex items-center justify-center my-3 select-none pointer-events-none ${className}` },
    svg
  );
}
