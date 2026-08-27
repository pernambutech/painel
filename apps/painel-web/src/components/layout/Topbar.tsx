// Componente Topbar
// Barra superior com botão hamburger e informação da organização

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { ambientesApi } from '@/lib/api';
import { Bell, Building2, ChevronDown, CircleHelp } from 'lucide-react';
import type { Ambiente } from '@/types';

export function Topbar() {
  const { organizacao, usuario } = useAuth();
  const [ambientesOnline, setAmbientesOnline] = useState(0);
  const [ambientesOffline, setAmbientesOffline] = useState(0);

  useEffect(() => {
    if (!organizacao) return;

    ambientesApi.listar(organizacao.id).then((ambientes: Ambiente[]) => {
      setAmbientesOnline(ambientes.filter((ambiente) => ambiente.agente?.status === 'online').length);
      setAmbientesOffline(ambientes.filter((ambiente) => ambiente.agente && ambiente.agente.status !== 'online').length);
    }).catch(() => {
      setAmbientesOnline(0);
      setAmbientesOffline(0);
    });
  }, [organizacao]);

  return (
    <header className="sticky top-0 z-30 flex min-h-[58px] flex-wrap items-center gap-4 border-b border-[#2a2a32] bg-[#16161a] px-4 py-3 sm:px-8">
      <div className="flex items-center gap-2 rounded-full border border-[#2a2a32] bg-[#1e1e24] py-1.5 pl-3 pr-2.5 text-zinc-300">
          <Building2 className="h-3.5 w-3.5 text-[#7f98ff]" />
          <span className="text-xs font-medium">{organizacao?.nome || 'Carregando...'}</span>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden items-center gap-3 text-xs text-zinc-400 md:flex">
          <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-300" />{ambientesOnline} ambientes online</span>
          <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-red-300" />{ambientesOffline} offline</span>
        </div>
        <button
          type="button"
          className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-[#28282f] hover:text-zinc-100"
          aria-label="Notificações"
          title="Notificações"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <button type="button" className="hidden rounded-md p-1 text-zinc-400 transition-colors hover:bg-[#28282f] hover:text-zinc-100 sm:block" aria-label="Ajuda" title="Ajuda"><CircleHelp className="h-[18px] w-[18px]" /></button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5b7cfa] text-sm font-semibold text-white" title={usuario?.nome || 'Usuário'}>{usuario?.nome?.split(' ').map((parte) => parte[0]).join('').slice(0, 2).toUpperCase() || 'U'}</div>
      </div>
    </header>
  );
}
