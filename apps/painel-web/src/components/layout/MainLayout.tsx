// Componente MainLayout
// Layout principal do painel (sidebar + topbar + conteúdo)

'use client';

import { ReactNode } from 'react';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayoutInterno({ children }: MainLayoutProps) {
  const { aberta } = useSidebar();

  return (
    <div className="h-dvh bg-[#0d0d0f] flex overflow-hidden">
      {/* Sidebar com transição */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div
        className={`
          flex-1 flex flex-col h-dvh overflow-hidden
          transition-all duration-300 ease-in-out
          ${aberta ? 'ml-64' : 'ml-0'}
        `}
      >
        {/* Topbar fixa no topo */}
        <Topbar />

        {/* Área de conteúdo com scroll */}
        <main className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">{children}</main>
      </div>
    </div>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <MainLayoutInterno>{children}</MainLayoutInterno>
    </SidebarProvider>
  );
}
