// Hook de autenticação
// Facilita o acesso ao contexto de autenticação

'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return contexto;
}
