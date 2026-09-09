// Layout das páginas de autenticação
// Inicializa variáveis CSS de aparência para aplicar tema no login/cadastro

'use client';

import { ReactNode } from 'react';
import { useAparencia } from '@/lib/hooks/useAparencia';

export default function AuthLayout({ children }: { children: ReactNode }) {
  useAparencia();
  return <>{children}</>;
}
