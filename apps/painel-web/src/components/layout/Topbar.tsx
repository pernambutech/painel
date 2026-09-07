// Componente Topbar
// Barra superior com: organização, notificações reais, ajuda e perfil

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { ambientesApi, organizacoesApi } from '@/lib/api';
import {
  Bell,
  Building2,
  ChevronDown,
  CircleHelp,
  LogOut,
  Settings,
  UserRound,
  WifiOff,
  BookOpen,
  Menu,
} from 'lucide-react';
import type { Ambiente, Organizacao } from '@/types';

interface Notificacao {
  id: string;
  tipo: 'ambiente_offline' | 'info';
  titulo: string;
  descricao: string;
  criadoEm: string;
}

interface TopbarProps {
  aoAbrirSidebar?: () => void;
}

export function Topbar({ aoAbrirSidebar }: TopbarProps) {
  const { organizacao, usuario, alterarOrganizacao, logout } = useAuth();
  const [ambientesOnline, setAmbientesOnline] = useState(0);
  const [ambientesOffline, setAmbientesOffline] = useState(0);
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [menuAberto, setMenuAberto] = useState<'organizacao' | 'notificacoes' | 'ajuda' | 'perfil' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!organizacao) return;

    ambientesApi.listar(organizacao.id).then((ambientes: Ambiente[]) => {
      const online = ambientes.filter((amb) => amb.agente?.status === 'online').length;
      const offline = ambientes.filter((amb) => amb.agente && amb.agente.status !== 'online');

      setAmbientesOnline(online);
      setAmbientesOffline(offline.length);

      // Gerar notificações reais a partir de agentes offline
      const novasNotificacoes: Notificacao[] = offline.map((amb) => ({
        id: amb.id,
        tipo: 'ambiente_offline' as const,
        titulo: `${amb.nome} — Agente desconectado`,
        descricao: `O agente deste ambiente está offline. Último heartbeat: ${
          amb.agente?.ultimoHeartbeat
            ? new Date(amb.agente.ultimoHeartbeat).toLocaleString('pt-BR')
            : 'nunca registrado'
        }.`,
        criadoEm: amb.agente?.ultimoHeartbeat || new Date().toISOString(),
      }));

      setNotificacoes(novasNotificacoes);
    }).catch(() => {
      setAmbientesOnline(0);
      setAmbientesOffline(0);
      setNotificacoes([]);
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

  const temNotificacoes = notificacoes.length > 0;

  return (
    <header ref={menuRef} className="sticky top-0 z-30 flex min-h-[48px] flex-wrap items-center gap-5 border-b border-[#2a2a32] bg-[#16161a]" style={{ padding: '12px 32px' }}>
      {/* Hamburger — apenas no mobile */}
      {aoAbrirSidebar && (
        <button
          onClick={aoAbrirSidebar}
          className="p-1.5 text-zinc-400 hover:text-zinc-100 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => alternarMenu('organizacao')}
          className="flex items-center gap-2 rounded-full border border-[#2a2a32] bg-[#1e1e24] py-1.5 pl-3 pr-2.5 text-zinc-300 hover:border-[#5b7cfa]"
          aria-expanded={menuAberto === 'organizacao'}
          aria-haspopup="true"
          aria-label="Selecionar organização"
        >
          <Building2 className="h-3.5 w-3.5 text-[#7f98ff]" />
          <span className="text-xs font-medium">{organizacao?.nome || 'Carregando...'}</span>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        </button>
        {menuAberto === 'organizacao' && (
          <div role="menu" aria-label="Lista de organizações" className="absolute left-0 top-11 z-50 min-w-64 rounded-lg border border-[#2a2a32] bg-[#1e1e24] p-1 shadow-xl">
            <p className="px-3 py-2 text-[11px] uppercase text-zinc-500">Organizações</p>
            {organizacoes.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={() => { alterarOrganizacao(item); setMenuAberto(null); }}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs text-zinc-300 hover:bg-[#28282f]"
              >
                <span>{item.nome}</span>
                {item.id === organizacao?.id && <span className="text-[#8ca2ff]">Ativa</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Env-status + Ações — empurrados para direita */}
      <div className="flex items-center" style={{ marginLeft: 'auto', gap: '20px' }}>
        <div className="hidden items-center text-xs md:flex" style={{ gap: '12px', color: '#a8a8b3' }}>
          <span className="flex items-center" style={{ gap: '6px' }}><span className="inline-block rounded-full" style={{ width: '8px', height: '8px', background: '#3dd68c' }} />{ambientesOnline} ambientes online</span>
          <span className="flex items-center" style={{ gap: '6px' }}><span className="inline-block rounded-full" style={{ width: '8px', height: '8px', background: '#f87171' }} />{ambientesOffline} offline</span>
        </div>

        {/* Ações: sino, ajuda, avatar */}
        <div className="flex items-center" style={{ gap: '16px' }}>
          {/* Sininho */}
          <div className="relative">
            <button
              type="button"
              onClick={() => alternarMenu('notificacoes')}
              className="relative rounded-md p-1 text-zinc-400 transition-colors hover:bg-[#28282f] hover:text-zinc-100"
              aria-label={`Notificações${temNotificacoes ? ` (${notificacoes.length} não lidas)` : ''}`}
              aria-expanded={menuAberto === 'notificacoes'}
              aria-haspopup="true"
              title="Notificações"
            >
              <Bell className="h-[18px] w-[18px]" />
              {temNotificacoes && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  {notificacoes.length}
                </span>
              )}
            </button>
          {menuAberto === 'notificacoes' && (
            <div role="menu" aria-label="Lista de notificações" className="absolute right-0 top-9 z-50 w-72 rounded-lg border border-[#2a2a32] bg-[#1e1e24] shadow-xl">
              <div className="border-b border-[#2a2a32] px-3 py-2.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Notificações</p>
              </div>
              {temNotificacoes ? (
                <div className="max-h-64 overflow-y-auto">
                  {notificacoes.map((notif) => (
                    <div key={notif.id} role="menuitem" className="flex items-start gap-2.5 border-b border-[#2a2a32] px-3 py-2.5 last:border-0 hover:bg-[#28282f]">
                      <WifiOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-200">{notif.titulo}</p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">{notif.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-zinc-500">Nenhuma notificação nova.</p>
                  <p className="mt-1 text-[11px] text-zinc-600">Todos os agentes estão conectados.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== AJUDA — Passo a passo / Documentação ===== */}
        <div className="relative">
          <button
            type="button"
            onClick={() => alternarMenu('ajuda')}
            className="hidden rounded-md p-1 text-zinc-400 transition-colors hover:bg-[#28282f] hover:text-zinc-100 sm:block"
            aria-label="Ajuda"
            aria-expanded={menuAberto === 'ajuda'}
            aria-haspopup="true"
            title="Ajuda"
          >
            <CircleHelp className="h-[18px] w-[18px]" />
          </button>
          {menuAberto === 'ajuda' && (
            <div role="menu" aria-label="Menu de ajuda" className="absolute right-0 top-9 z-50 w-64 rounded-lg border border-[#2a2a32] bg-[#1e1e24] p-1 shadow-xl">
              <p className="px-3 py-2 text-[11px] font-medium uppercase text-zinc-500">Ajuda e Documentação</p>

              <Link href="/ajuda" onClick={() => setMenuAberto(null)} role="menuitem" className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-300 hover:bg-[#28282f]">
                <BookOpen className="h-3.5 w-3.5 text-[#8ca2ff]" />
                Guia rápido de uso
              </Link>

              <Link href="/ajuda#guia-completo" onClick={() => setMenuAberto(null)} role="menuitem" className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-300 hover:bg-[#28282f]">
                <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
                Guia completo de uso
              </Link>

              <Link href="/configuracoes" onClick={() => setMenuAberto(null)} role="menuitem" className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-300 hover:bg-[#28282f]">
                <Settings className="h-3.5 w-3.5 text-zinc-400" />
                Configurações
              </Link>

              <div className="my-1 border-t border-[#2a2a32]" />

              <div className="px-3 py-2">
                <p className="text-[11px] font-medium text-zinc-400">Passo a passo rápido</p>
                <ol className="mt-1.5 space-y-1 text-[11px] text-zinc-500">
                  <li><span className="font-medium text-zinc-400">1.</span> Crie um ambiente</li>
                  <li><span className="font-medium text-zinc-400">2.</span> Conecte o agente na máquina</li>
                  <li><span className="font-medium text-zinc-400">3.</span> Crie um projeto</li>
                  <li><span className="font-medium text-zinc-400">4.</span> Adicione serviços (frontend, backend…)</li>
                  <li><span className="font-medium text-zinc-400">5.</span> Inicie e monitore pelo painel</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* ===== PERFIL — Menu expandido ===== */}
        <div className="relative">
          <button
            type="button"
            onClick={() => alternarMenu('perfil')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5b7cfa] text-sm font-semibold text-white"
            title={usuario?.nome || 'Usuário'}
            aria-label="Abrir perfil"
            aria-expanded={menuAberto === 'perfil'}
            aria-haspopup="true"
          >
            {usuario?.nome?.split(' ').map((parte) => parte[0]).join('').slice(0, 2).toUpperCase() || 'U'}
          </button>
          {menuAberto === 'perfil' && (
            <div role="menu" aria-label="Menu do perfil" className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-[#2a2a32] bg-[#1e1e24] p-2 shadow-xl">
              <div className="flex items-center gap-2 border-b border-[#2a2a32] px-3 py-2">
                <UserRound className="h-4 w-4 text-[#8ca2ff]" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-zinc-200">{usuario?.nome || 'Usuário'}</p>
                  <p className="truncate text-[11px] text-zinc-500">{usuario?.email}</p>
                </div>
              </div>

              <Link
                href="/configuracoes"
                onClick={() => setMenuAberto(null)}
                role="menuitem"
                className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-300 hover:bg-[#28282f]"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={logout}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-300 hover:bg-[#28282f]"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </header>
  );
}
