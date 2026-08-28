// Componente Topbar
// Barra superior com botão hamburger e informação da organização

'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { ambientesApi, organizacoesApi } from '@/lib/api';
import { Bell, Building2, ChevronDown, CircleHelp, LogOut, UserRound } from 'lucide-react';
import type { Ambiente, Organizacao } from '@/types';

export function Topbar() {
  const { organizacao, usuario, alterarOrganizacao, logout } = useAuth();
  const [ambientesOnline, setAmbientesOnline] = useState(0);
  const [ambientesOffline, setAmbientesOffline] = useState(0);
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [menuAberto, setMenuAberto] = useState<'organizacao' | 'notificacoes' | 'ajuda' | 'perfil' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    organizacoesApi.listar().then(setOrganizacoes).catch(() => setOrganizacoes([]));
  }, []);

  useEffect(() => {
    const fecharMenu = (evento: MouseEvent) => {
      if (!menuRef.current?.contains(evento.target as Node)) setMenuAberto(null);
    };
    document.addEventListener('mousedown', fecharMenu);
    return () => document.removeEventListener('mousedown', fecharMenu);
  }, []);

  const alternarMenu = (menu: typeof menuAberto) => {
    setMenuAberto((atual) => (atual === menu ? null : menu));
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-[58px] flex-wrap items-center gap-4 border-b border-[#2a2a32] bg-[#16161a] px-4 py-3 sm:px-8">
      <div className="relative" ref={menuRef}>
        <button type="button" onClick={() => alternarMenu('organizacao')} className="flex items-center gap-2 rounded-full border border-[#2a2a32] bg-[#1e1e24] py-1.5 pl-3 pr-2.5 text-zinc-300 hover:border-[#5b7cfa]" aria-expanded={menuAberto === 'organizacao'}>
          <Building2 className="h-3.5 w-3.5 text-[#7f98ff]" />
          <span className="text-xs font-medium">{organizacao?.nome || 'Carregando...'}</span>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        </button>
        {menuAberto === 'organizacao' && <div className="absolute left-0 top-11 z-50 min-w-64 rounded-lg border border-[#2a2a32] bg-[#1e1e24] p-1 shadow-xl"><p className="px-3 py-2 text-[11px] uppercase text-zinc-500">Organizações</p>{organizacoes.map((item) => <button key={item.id} type="button" onClick={() => { alterarOrganizacao(item); setMenuAberto(null); }} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs text-zinc-300 hover:bg-[#28282f]"><span>{item.nome}</span>{item.id === organizacao?.id && <span className="text-[#8ca2ff]">Ativa</span>}</button>)}</div>}
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden items-center gap-3 text-xs text-zinc-400 md:flex">
          <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-300" />{ambientesOnline} ambientes online</span>
          <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-red-300" />{ambientesOffline} offline</span>
        </div>
        <div className="relative">
        <button type="button" onClick={() => alternarMenu('notificacoes')}
          className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-[#28282f] hover:text-zinc-100"
          aria-label="Notificações"
          title="Notificações"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>
        {menuAberto === 'notificacoes' && <div className="absolute right-0 top-9 z-50 w-56 rounded-lg border border-[#2a2a32] bg-[#1e1e24] p-3 text-xs text-zinc-400 shadow-xl">Nenhuma notificação nova.</div>}
        </div>
        <div className="relative">
          <button type="button" onClick={() => alternarMenu('ajuda')} className="hidden rounded-md p-1 text-zinc-400 transition-colors hover:bg-[#28282f] hover:text-zinc-100 sm:block" aria-label="Ajuda" title="Ajuda"><CircleHelp className="h-[18px] w-[18px]" /></button>
          {menuAberto === 'ajuda' && <div className="absolute right-0 top-9 z-50 w-52 rounded-lg border border-[#2a2a32] bg-[#1e1e24] p-2 shadow-xl"><a href="/configuracoes" className="block rounded-md px-3 py-2 text-xs text-zinc-300 hover:bg-[#28282f]">Configurações e suporte</a></div>}
        </div>
        <div className="relative">
          <button type="button" onClick={() => alternarMenu('perfil')} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5b7cfa] text-sm font-semibold text-white" title={usuario?.nome || 'Usuário'} aria-label="Abrir perfil">{usuario?.nome?.split(' ').map((parte) => parte[0]).join('').slice(0, 2).toUpperCase() || 'U'}</button>
          {menuAberto === 'perfil' && <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-[#2a2a32] bg-[#1e1e24] p-2 shadow-xl"><div className="flex items-center gap-2 border-b border-[#2a2a32] px-3 py-2"><UserRound className="h-4 w-4 text-[#8ca2ff]" /><span className="truncate text-xs text-zinc-300">{usuario?.email}</span></div><button type="button" onClick={logout} className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-300 hover:bg-[#28282f]"><LogOut className="h-4 w-4" />Sair</button></div>}
        </div>
      </div>
    </header>
  );
}
