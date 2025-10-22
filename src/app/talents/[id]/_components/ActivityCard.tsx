"use client";

import { useState } from 'react';
import Link from 'next/link';

export function ActivityCard({ activity }: { activity: any }) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (value: unknown): string => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(String(value));
    return isNaN(date.getTime()) ? '' : date.toLocaleString();
  };

  const a = activity || {};

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{typeof a.title === 'string' ? a.title : ''}</p>
          {a?.description ? (
            <p className="mt-1 text-xs text-gray-700 whitespace-pre-wrap break-words">{String(a.description)}</p>
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
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <p className="capitalize">Status: {typeof a.status === 'string' ? a.status : ''}</p>
            <div className="text-right">
              <p>Início: {formatDate(a?.startDate)}</p>
              {a?.endDate ? <p>Fim: {formatDate(a.endDate)}</p> : null}
            </div>
          </div>

          {Array.isArray(a.participants) && a.participants.length > 0 && (
            <div className="text-xs text-gray-800">
              <p className="font-medium mb-1">Participantes:</p>
              <div className="flex flex-wrap gap-2">
                {a.participants.map((p: any) => {
                  const label = p?.user?.name || p?.user?.email;
                  const userId = p?.user?.id;
                  return userId ? (
                    <Link
                      key={`${p.id}`}
                      href={`/talents/${userId}`}
                      className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span key={`${p.id}`} className="px-2 py-1 rounded bg-gray-100">{label}</span>
                  );
                })}
              </div>
            </div>
          )}

          {Array.isArray(a.links) && a.links.length > 0 && (
            <div className="text-xs text-gray-800">
              <p className="font-medium mb-1">Links:</p>
              <ul className="list-disc ml-4">
                {a.links.map((l: any) => (
                  <li key={`${l.id}`}>
                    <a className="text-purple-600 hover:underline" href={l.url} target="_blank" rel="noreferrer">
                      {l.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(a.observations) && a.observations.length > 0 && (
            <div className="text-xs text-gray-800">
              <p className="font-medium mb-1">Observações:</p>
              <div className="space-y-2">
                {a.observations.map((o: any) => (
                  <div key={`${o.id}`} className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-700 break-words">{o.content}</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      por {o?.user?.name || o?.user?.email} • {formatDate(o?.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


