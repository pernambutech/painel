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
    <div className="min-h-screen bg-zinc-950">
      {/* Sidebar fixa à esquerda */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div className="ml-64">
        {/* Topbar fixa no topo */}
        <Topbar />

        {/* Área de conteúdo */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
