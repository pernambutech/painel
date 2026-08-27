// Componente MainLayout
// Layout principal do painel (sidebar + topbar + conteúdo)

'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen bg-zinc-950 flex">
      {/* Sidebar fixa à esquerda */}
      <Sidebar />

      {/* Conteúdo principal com scroll */}
      <div className="flex-1 flex flex-col ml-64 h-screen overflow-hidden">
        {/* Topbar fixa no topo */}
        <Topbar />

        {/* Área de conteúdo com scroll */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
