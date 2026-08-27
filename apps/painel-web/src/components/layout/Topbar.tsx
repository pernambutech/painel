// Componente Topbar
// Barra superior com botão hamburger e informação da organização

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useSidebar } from '@/contexts/SidebarContext';
import { Bell, Building2, ChevronDown, Menu } from 'lucide-react';

export function Topbar() {
  const { organizacao } = useAuth();
  const { alternar } = useSidebar();

  return (
    <header className="min-h-16 border-b border-[#2a2a32] bg-[#16161a]/95 backdrop-blur-sm flex items-center justify-between gap-4 px-5 sm:px-8 sticky top-0 z-30">
      {/* Lado esquerdo */}
      <div className="flex items-center gap-3">
        {/* Botão hamburger */}
        <button
          onClick={alternar}
          className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#28282f] transition-colors"
          title="Alternar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#2a2a32] bg-[#1e1e24] py-1.5 pl-3 pr-2.5 text-zinc-300">
          <Building2 className="w-3.5 h-3.5 text-[#7f98ff]" />
          <span className="text-xs font-medium">{organizacao?.nome || 'Carregando...'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
        </div>
      </div>

      {/* Lado direito */}
      <div className="flex items-center gap-4">
        {/* Indicador de status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="hidden md:inline text-xs text-zinc-400">Ambientes operacionais</span>
        </div>
        <button
          type="button"
          className="p-2 -mr-2 rounded-lg text-zinc-400 hover:bg-[#28282f] hover:text-zinc-100 transition-colors"
          aria-label="Notificações"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
