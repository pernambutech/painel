// Componente ProtectedRoute
// Protege rotas que exigem autenticação

'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CarregandoPagina } from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { autenticado, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !autenticado) {
      router.push('/login');
    }
  }, [autenticado, carregando, router]);

  // Mostrar carregando enquanto verifica autenticação
  if (carregando) {
    return <CarregandoPagina />;
  }

  // Se não estiver autenticado, não renderizar nada (vai redirecionar)
  if (!autenticado) {
    return null;
  }

  // Se estiver autenticado, renderizar o conteúdo
  return <>{children}</>;
}
