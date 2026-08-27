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
import { useSidebar } from '@/contexts/SidebarContext';

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
  const { aberta } = useSidebar();

  return (
    <aside
      className={`
        h-dvh bg-[#16161a] border-r border-[#2a2a32] flex flex-col fixed left-0 top-0 z-40 overflow-hidden
        transition-all duration-300 ease-in-out
        ${aberta ? 'w-64' : 'w-0'}
      `}
    >
      {/* Conteúdo só visível quando aberta */}
      <div className={`w-64 h-full flex flex-col ${aberta ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}>
        {/* Logo */}
        <div className="px-5 pt-5 pb-6 border-b border-[#2a2a32]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5b7cfa]/15 text-[#7f98ff] flex items-center justify-center">
              <Boxes className="w-[18px] h-[18px]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-zinc-100">Painel</h1>
              <p className="text-[11px] text-zinc-500">Centro de controle</p>
            </div>
          </div>
        </div>

        {/* Navegação principal */}
        <nav aria-label="Navegação principal" className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">Operação</p>
          {itensNavegacao.map((item) => {
            const Icone = item.icone;
            const ativo = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

            return (
              <Link
                key={item.nome}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-[13px] transition-colors duration-150
                  ${
                    ativo
                      ? 'bg-[#5b7cfa]/15 text-[#8ca2ff] font-medium'
                      : 'text-zinc-400 hover:bg-[#28282f] hover:text-zinc-100'
                  }
                `}
              >
                <Icone className="w-4 h-4" />
                {item.nome}
              </Link>
            );
          })}
        </nav>

        {/* Itens inferiores */}
        <div className="p-3 border-t border-[#2a2a32] space-y-1">
          {itensInferior.map((item) => {
            const Icone = item.icone;
            const ativo = pathname === item.href;

            return (
              <Link
                key={item.nome}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-[13px] transition-colors duration-150
                  ${
                    ativo
                      ? 'bg-[#5b7cfa]/15 text-[#8ca2ff] font-medium'
                      : 'text-zinc-400 hover:bg-[#28282f] hover:text-zinc-100'
                  }
                `}
              >
                <Icone className="w-4 h-4" />
                {item.nome}
              </Link>
            );
          })}

          {/* Usuário e logout */}
          <div className="flex items-center justify-between px-3 pt-3 pb-1 mt-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#5b7cfa] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-white">
                  {usuario?.nome?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-xs text-zinc-400 truncate">{usuario?.nome || 'Usuário'}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
