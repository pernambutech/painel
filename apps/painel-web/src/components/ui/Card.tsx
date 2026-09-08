// Componente Card
// Container reutilizável com elevação

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'nenhum' | 'pequeno' | 'medio' | 'grande';
}

const estilosPadding = {
  nenhum: '',
  pequeno: 'p-3',
  medio: 'p-5',
  grande: 'p-6',
};

export function Card({ children, className = '', padding = 'medio' }: CardProps) {
  return (
    <div
      className={`
        rounded-xl border cor-borda cor-superficie
        ${estilosPadding[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
