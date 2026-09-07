// Componente StatusBadgeTabela
// Badge compacto para uso em tabelas com bolinha colorida + texto

import { ReactNode } from 'react';

// ===========================================
// TIPOS
// ===========================================

type VarianteStatus = 'online' | 'atencao' | 'erro' | 'parado';

interface StatusBadgeTabelaProps {
  variante: VarianteStatus;
  children: ReactNode;
}

// ===========================================
// ESTILOS DAS VARIANTES
// ===========================================

const estilosVariante: Record<VarianteStatus, string> = {
  online: 'text-emerald-300',
  atencao: 'text-amber-300',
  erro: 'text-red-300',
  parado: 'text-zinc-400',
};

const coresPonto: Record<VarianteStatus, string> = {
  online: 'bg-emerald-300',
  atencao: 'bg-amber-300',
  erro: 'bg-red-300',
  parado: 'bg-zinc-400',
};

// ===========================================
// COMPONENTE
// ===========================================

export function StatusBadgeTabela({ variante, children }: StatusBadgeTabelaProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${estilosVariante[variante]}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${coresPonto[variante]}`} />
      {children}
    </span>
  );
}
