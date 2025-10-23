"use client";

import { useState } from 'react';

export function ExperienceCard({ experience }: { experience: any }) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (value: unknown): string => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(String(value));
    return isNaN(date.getTime()) ? '' : date.toLocaleString();
  };

  const e = experience || {};

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{[e.role, e.company].filter(Boolean).join(' • ')}</p>
          {e?.details ? (
            <p className="mt-1 text-xs text-gray-700 whitespace-pre-wrap break-words line-clamp-2">
              {String(e.details)}
            </p>
          ) : null}
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-black text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 shrink-0"
        >
          {expanded ? 'Recolher' : 'Expandir'}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2 text-xs text-gray-800">
          <div className="flex items-center justify-between text-gray-600">
            <div />
            <div className="text-right">
              <p>Início: {formatDate(e?.startDate)}</p>
              {e?.endDate ? <p>Fim: {formatDate(e.endDate)}</p> : null}
            </div>
          </div>

          {e?.details ? (
            <div>
              <p className="font-medium mb-1">Detalhes:</p>
              <p className="whitespace-pre-wrap break-words">{String(e.details)}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}


