// Componente Sidebar
// Navegação lateral principal com drawer responsivo no mobile

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Server,
  Monitor,
  FileText,
  Settings,
  History,
  X,
  LogOut,
  Play,
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
    nome: 'Logs',
    href: '/logs',
    icone: FileText,
  },
  {
    nome: 'Execuções',
    href: '/execucoes',
    icone: Play,
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
// TIPOS
// ===========================================

interface SidebarProps {
  aberta: boolean;
  aoFechar: () => void;
}

// ===========================================
// COMPONENTE
// ===========================================

export function Sidebar({ aberta, aoFechar }: SidebarProps) {
  const pathname = usePathname();
  const { logout, usuario } = useAuth();

  // Fecha o drawer ao navegar (mobile)
  const handleNavegacao = () => {
    if (window.innerWidth < 1024) {
      aoFechar();
    }
  };

  return (
    <>
      {/* Backdrop — apenas no mobile quando sidebar está aberta */}
      {aberta && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={aoFechar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          dashboard-sidebar
          fixed inset-y-0 left-0 z-50 flex h-dvh w-[240px] flex-col overflow-y-auto
          border-r border-[#2a2a32] bg-[#16161a] px-4 py-5
          transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${aberta ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Botão fechar — apenas no mobile */}
        <button
          onClick={aoFechar}
          className="absolute right-3 top-3 p-1.5 text-zinc-500 hover:text-zinc-300 lg:hidden"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="mb-6 border-b border-[#2a2a32] px-1 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5b7cfa]/15 text-[#7f98ff]">
              <LayoutDashboard className="h-[18px] w-[18px]" aria-hidden="true" />
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
                onClick={handleNavegacao}
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
                onClick={handleNavegacao}
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
              aria-label="Sair da conta"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
