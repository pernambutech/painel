// Componente Topbar
// Barra superior com informação da organização

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Building2 } from 'lucide-react';

export function Topbar() {
  const { organizacao } = useAuth();

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Lado esquerdo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-zinc-400">
          <Building2 className="w-4 h-4" />
          <span className="text-sm">{organizacao?.nome || 'Carregando...'}</span>
        </div>
      </div>

      {/* Lado direito */}
      <div className="flex items-center gap-4">
        {/* Indicador de status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-zinc-500">Sistema operacional</span>
        </div>
      </div>
    </header>
  );
}
