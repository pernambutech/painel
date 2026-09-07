// Layout do painel
// Inclui Sidebar, Topbar e proteção de rotas

'use client';

import { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAparencia } from '@/lib/hooks/useAparencia';

export default function PainelLayout({ children }: { children: ReactNode }) {
  // Inicializa aparência (aplica variáveis CSS do localStorage)
  useAparencia();

  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}
