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
        h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col fixed left-0 top-0 z-40
        transition-all duration-300 ease-in-out
        ${aberta ? 'w-64' : 'w-0'}
      `}
    >
      {/* Conteúdo só visível quando aberta */}
      <div className={`w-64 h-full flex flex-col ${aberta ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}>
        {/* Logo */}
        <div className="p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-zinc-100">Painel</h1>
              <p className="text-xs text-zinc-500">v0.1.0</p>
            </div>
          </div>
        </div>

        {/* Navegação principal */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {itensNavegacao.map((item) => {
            const Icone = item.icone;
            const ativo = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

            return (
              <Link
                key={item.nome}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg
                  text-sm transition-colors duration-150
                  ${
                    ativo
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
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
        <div className="p-3 border-t border-zinc-800 space-y-1">
          {itensInferior.map((item) => {
            const Icone = item.icone;
            const ativo = pathname === item.href;

            return (
              <Link
                key={item.nome}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg
                  text-sm transition-colors duration-150
                  ${
                    ativo
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }
                `}
              >
                <Icone className="w-4 h-4" />
                {item.nome}
              </Link>
            );
          })}

          {/* Usuário e logout */}
          <div className="flex items-center justify-between px-3 py-2 mt-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-zinc-300">
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
