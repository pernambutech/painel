// Componente Sidebar
// Navegação lateral principal com drawer responsivo no mobile

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Server,
  Monitor,
  FileText,
  Settings,
  History,
  X,
  User,
  Play,
  Box,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAparencia } from '@/lib/hooks/useAparencia';
import { dashboardApi, ambientesApi } from '@/lib/api';

// ===========================================
// ITENS DE NAVEGAÇÃO
// ===========================================

interface ItemNavegacao {
  nome: string;
  href: string;
  icone: typeof LayoutDashboard;
  chaveContador?: string;
}

const itensNavegacao: ItemNavegacao[] = [
  {
    nome: 'Visão Geral',
    href: '/dashboard',
    icone: LayoutDashboard,
  },
  {
    nome: 'Projetos',
    href: '/projetos',
    icone: FolderOpen,
    chaveContador: 'projetos',
  },
  {
    nome: 'Serviços',
    href: '/servicos',
    icone: Server,
    chaveContador: 'servicos',
  },
  {
    nome: 'Ambientes',
    href: '/ambientes',
    icone: Monitor,
    chaveContador: 'ambientes',
  },
  {
    nome: 'Execuções',
    href: '/execucoes',
    icone: Play,
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
  {
    nome: 'Perfil',
    href: '/configuracoes',
    icone: User,
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
  const { organizacao } = useAuth();
  const { prefs } = useAparencia();
  const [contadores, setContadores] = useState<Record<string, number>>({});

  // Buscar contadores para os badges
  useEffect(() => {
    if (!organizacao) return;

    const carregarContadores = async () => {
      try {
        const [dashboardDados, ambientesDados] = await Promise.all([
          dashboardApi.obterDados(organizacao.id),
          ambientesApi.listar(organizacao.id),
        ]);

        setContadores({
          projetos: dashboardDados?.totalProjetos ?? 0,
          servicos: dashboardDados?.totalServicos ?? 0,
          ambientes: (ambientesDados || []).length,
        });
      } catch {
        // Erro silencioso — badges ficam vazios
      }
    };

    carregarContadores();
  }, [organizacao]);

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
          border-r border-[#2a2a32] bg-[#16161a]
          transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${aberta ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ padding: '20px 16px' }}
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
        <div className="flex items-center gap-2.5 border-b border-[#2a2a32] pb-7" style={{ marginBottom: '24px' }}>
          <Box className="h-6 w-6" style={{ color: prefs.corDestaque }} />
          <h1 className="text-[18px] font-bold tracking-tight text-zinc-100">{prefs.nomeAplicacao}</h1>
        </div>

        {/* Navegação principal */}
        <nav aria-label="Navegação principal" className="flex-1">
          <div
            className="text-[11px] font-medium uppercase ml-3 mb-2 mt-1"
            style={{ letterSpacing: '0.6px', color: '#6e6e7a' }}
          >
            Navegação
          </div>
          {itensNavegacao.map((item) => {
            const Icone = item.icone;
            const ativo = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            const contador = item.chaveContador ? contadores[item.chaveContador] : undefined;

            return (
              <Link
                key={item.nome}
                href={item.href}
                onClick={handleNavegacao}
                className={`
                  flex items-center gap-3 rounded-md text-[13px] transition-colors duration-150
                  mb-0.5
                  ${
                    ativo
                      ? 'bg-[#5b7cfa]/15 text-[#8ca2ff] font-medium'
                      : 'text-zinc-400 hover:bg-[#28282f] hover:text-zinc-100'
                  }
                `}
                style={{ padding: '10px 14px' }}
              >
                <Icone className="h-4 w-4 shrink-0" />
                <span>{item.nome}</span>
                {item.chaveContador && contador !== undefined && (
                  <span
                    className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ background: '#24242b', color: '#6e6e7a' }}
                  >
                    {contador}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Itens inferiores */}
        <div className="mt-1 border-t border-[#2a2a32] pt-4">
          {itensInferior.map((item) => {
            const Icone = item.icone;
            const ativo = pathname === item.href;

            return (
              <Link
                key={item.nome}
                href={item.href}
                onClick={handleNavegacao}
                className={`
                  flex items-center gap-3 rounded-md text-[13px] transition-colors duration-150
                  ${
                    ativo
                      ? 'bg-[#5b7cfa]/15 text-[#8ca2ff] font-medium'
                      : 'text-zinc-400 hover:bg-[#28282f] hover:text-zinc-100'
                  }
                `}
                style={{ padding: '10px 14px' }}
              >
                <Icone className="h-4 w-4 shrink-0" />
                <span>{item.nome}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
