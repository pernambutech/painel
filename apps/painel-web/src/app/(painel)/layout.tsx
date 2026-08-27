// Layout do painel
// Inclui Sidebar, Topbar e proteção de rotas

'use client';

import { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function PainelLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}
