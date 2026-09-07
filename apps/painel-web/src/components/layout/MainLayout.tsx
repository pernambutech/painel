// Componente MainLayout
// Layout principal do painel (sidebar + topbar + conteúdo)
// Sidebar responsiva com drawer no mobile

'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarAberta, setSidebarAberta] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#0d0d0f]">
      {/* Sidebar — sempre visível no desktop, drawer no mobile */}
      <Sidebar aberta={sidebarAberta} aoFechar={() => setSidebarAberta(false)} />

      <div className="main-layout-content flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar aoAbrirSidebar={() => setSidebarAberta(true)} />
        <main className="flex-1 overflow-y-auto" style={{ padding: '28px 32px 40px' }}>{children}</main>
      </div>
    </div>
  );
}
