// Componente Sidebar
// Navegação lateral principal com toggle de visibilidade

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Server,
  Monitor,
  History,
  FileText,
  Settings,
  LogOut,
  Boxes,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

// ===========================================
// ITENS DE NAVEGAÇÃO
// ===========================================

const itensNavegacao = [
  {
    nome: 'Visão Geral',
    href: '/dashboard',
    icone: LayoutDashboard,
  },
  {
    nome: 'Projetos',
    href: '/projetos',
    icone: FolderOpen,
  },
  {
    nome: 'Serviços',
    href: '/servicos',
    icone: Server,
  },
  {
    nome: 'Ambientes',
    href: '/ambientes',
    icone: Monitor,
  },
  {
    nome: 'Execuções',
    href: '/execucoes',
    icone: History,
  },
  {
    nome: 'Logs',
    href: '/logs',
    icone: FileText,
  },
  {
    nome: 'Histórico',
    href: '/historico',
    icone: History,
  },
];

const itensInferior = [
  {
    nome: 'Configurações',
    href: '/configuracoes',
    icone: Settings,
  },
];

// ===========================================
// COMPONENTE
// ===========================================

export function Sidebar() {
  const pathname = usePathname();
  const { logout, usuario } = useAuth();
  return (
    <aside className="dashboard-sidebar flex h-dvh w-[240px] shrink-0 flex-col overflow-y-auto border-r border-[#2a2a32] bg-[#16161a] px-4 py-5">
        {/* Logo */}
        <div className="mb-6 border-b border-[#2a2a32] px-1 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5b7cfa]/15 text-[#7f98ff]">
              <Boxes className="h-[18px] w-[18px]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold tracking-tight text-zinc-100">DevManager</h1>
            </div>
          </div>
        </div>

        {/* Navegação principal */}
        <nav aria-label="Navegação principal" className="flex-1 space-y-0.5">
          <p className="mb-2 ml-3 mt-1 text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-500">Navegação</p>
          {itensNavegacao.map((item) => {
            const Icone = item.icone;
            const ativo = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

            return (
              <Link
                key={item.nome}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13px] transition-colors duration-150
                  ${
                    ativo
                      ? 'bg-[#5b7cfa]/15 text-[#8ca2ff] font-medium'
                      : 'text-zinc-400 hover:bg-[#28282f] hover:text-zinc-100'
                  }
                `}
              >
                <Icone className="h-4 w-4 shrink-0" />
                <span>{item.nome}</span>
              </Link>
            );
          })}
        </nav>

        {/* Itens inferiores */}
        <div className="mt-4 space-y-1 border-t border-[#2a2a32] pt-4">
          {itensInferior.map((item) => {
            const Icone = item.icone;
            const ativo = pathname === item.href;

            return (
              <Link
                key={item.nome}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13px] transition-colors duration-150
                  ${
                    ativo
                      ? 'bg-[#5b7cfa]/15 text-[#8ca2ff] font-medium'
                      : 'text-zinc-400 hover:bg-[#28282f] hover:text-zinc-100'
                  }
                `}
              >
                <Icone className="h-4 w-4 shrink-0" />
                <span>{item.nome}</span>
              </Link>
            );
          })}

          {/* Usuário e logout */}
          <div className="mt-3 flex items-center justify-between px-3 pb-1 pt-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5b7cfa]">
                <span className="text-xs font-semibold text-white">
                  {usuario?.nome?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="truncate text-xs text-zinc-400">{usuario?.nome || 'Usuário'}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
    </aside>
  );
}
