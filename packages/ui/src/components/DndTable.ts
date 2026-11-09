import React from 'react';

export interface DndTableProps {
  headers: React.ReactNode[];
  rows: React.ReactNode[][];
  className?: string;
  caption?: string;
}

/**
 * DndTable: Tabla canónica de manual de D&D (Player's Handbook / Tasha).
 * Cabecera en carmesí profundo con texto en versalitas y filas alternadas
 * en pergamino suave con bordes envejecidos.
 */
export function DndTable({
  headers,
  rows,
  className = '',
  caption,
}: DndTableProps) {
  const captionElement = caption
    ? React.createElement(
        'caption',
        {
          className:
            'font-dnd-title font-bold text-base text-dnd-crimson p-2.5 text-left bg-dnd-parchment-contrast border-b border-dnd-border-antique',
        },
        caption
      )
    : null;

  const headerCells = headers.map((h, i) =>
    React.createElement(
      'th',
      {
        key: i,
        className:
          'py-2.5 px-3.5 border-b border-dnd-crimson-hover first:pl-4 last:pr-4',
      },
      h
    )
  );

  const thead = React.createElement(
    'thead',
    null,
    React.createElement(
      'tr',
      {
        className:
          'bg-dnd-crimson text-white font-dnd-title font-semibold tracking-wide text-xs select-none',
      },
      headerCells
    )
  );

  const bodyRows = rows.map((row, rIdx) => {
    const isEven = rIdx % 2 === 0;
    const rowClass = isEven
      ? 'bg-dnd-parchment'
      : 'bg-dnd-parchment-contrast hover:bg-dnd-parchment-dark transition-colors';

    const cells = row.map((cell, cIdx) =>
      React.createElement(
        'td',
        {
          key: cIdx,
          className: 'py-2 px-3.5 first:pl-4 last:pr-4',
        },
        cell
      )
    );

    return React.createElement(
      'tr',
      {
        key: rIdx,
        className: rowClass,
      },
      cells
    );
  });

  const tbody = React.createElement(
    'tbody',
    { className: 'divide-y divide-dnd-border-antique/50 font-dnd-body' },
    bodyRows
  );

  const table = React.createElement(
    'table',
    {
      className:
        'w-full text-left border-collapse text-sm text-dnd-ink',
    },
    captionElement,
    thead,
    tbody
  );

  return React.createElement(
    'div',
    {
      className: `overflow-x-auto my-4 border border-dnd-border-antique shadow-sm rounded-lg ${className}`,
    },
    table
  );
}
