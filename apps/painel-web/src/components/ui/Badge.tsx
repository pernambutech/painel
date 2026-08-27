// Componente Badge
// Indicador de status com cor e ícone

import { ReactNode } from 'react';

// ===========================================
// VARIANTES DE STATUS
// ===========================================

type VarianteBadge = 'online' | 'offline' | 'erro' | 'aviso' | 'info' | 'neutro';

interface BadgeProps {
  children: ReactNode;
  variante?: VarianteBadge;
  className?: string;
}

// ===========================================
// ESTILOS DAS VARIANTES
// ===========================================

const estilosVariante: Record<VarianteBadge, string> = {
  online: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20',
  offline: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  erro: 'bg-red-500/10 text-red-300 border-red-400/20',
  aviso: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  neutro: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
};

// ===========================================
// PONTOS DE STATUS (bolinha)
// ===========================================

const coresPonto: Record<VarianteBadge, string> = {
  online: 'bg-emerald-500',
  offline: 'bg-zinc-500',
  erro: 'bg-red-500',
  aviso: 'bg-amber-500',
  info: 'bg-blue-500',
  neutro: 'bg-zinc-400',
};

// ===========================================
// COMPONENTE
// ===========================================

export function Badge({ children, variante = 'neutro', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-full
        text-xs font-medium
        border
        ${estilosVariante[variante]}
        ${className}
      `}
    >
      {/* Ponto de status */}
      <span className={`w-1.5 h-1.5 rounded-full ${coresPonto[variante]}`} />
      {children}
    </span>
  );
}

// ===========================================
// COMPONENTE SIMPLES (sem ponto)
// ===========================================

export function BadgeSimples({ children, variante = 'neutro', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        px-2.5 py-1 rounded-full
        text-xs font-medium
        border
        ${estilosVariante[variante]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
