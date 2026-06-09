'use client';

import { useState, useRef, useEffect } from 'react';
import { Star, ChevronDown, ExternalLink, Loader2 } from 'lucide-react';

interface PropiedadMatch {
  id: number;
  tipo: string | null;
  direccion: string | null;
  zona: string | null;
  valor: number | null;
  dormitorios: number | null;
  match_score: number;
}

interface MatchesDropdownProps {
  busquedaId: number;
  matchesCount: number;
}

export function MatchesDropdown({ busquedaId, matchesCount }: MatchesDropdownProps) {
  const [open, setOpen]         = useState(false);
  const [matches, setMatches]   = useState<PropiedadMatch[]>([]);
  const [loading, setLoading]   = useState(false);
  const [fetched, setFetched]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al click fuera
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleToggle = async () => {
    setOpen(o => !o);
    if (!fetched && !loading) {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`/api/busquedas/${busquedaId}/matches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setMatches(await res.json());
      } finally {
        setLoading(false);
        setFetched(true);
      }
    }
  };

  const hasMatches = matchesCount > 0;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={handleToggle}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border transition ${
          hasMatches
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100'
            : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
        }`}
      >
        <Star size={10} className={hasMatches ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'} />
        {matchesCount} match{matchesCount !== 1 ? 'es' : ''}
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-bold text-gray-700">Propiedades coincidentes</p>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={18} className="animate-spin text-gray-400" />
              </div>
            ) : matches.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Sin coincidencias</p>
            ) : (
              matches.map(p => (
                <a
                  key={p.id}
                  href={`/propiedades?id=${p.id}`}
                  className="flex items-start justify-between px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {p.direccion || p.zona || `Propiedad #${p.id}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.tipo && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                          {p.tipo}
                        </span>
                      )}
                      {p.valor && (
                        <span className="text-xs text-gray-500">
                          USD {p.valor >= 1000 ? `${(p.valor / 1000).toFixed(0)}k` : p.valor}
                        </span>
                      )}
                      {p.dormitorios && (
                        <span className="text-xs text-gray-400">{p.dormitorios} dorm.</span>
                      )}
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-1" />
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
