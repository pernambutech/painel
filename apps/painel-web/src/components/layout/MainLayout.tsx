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
    <div className="flex h-dvh overflow-hidden bg-[#0d0d0f]">
      <Sidebar />
      <div className="main-layout-content flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-7">{children}</main>
      </div>
    </div>
  );
}
