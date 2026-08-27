// Componente Button
// Botão reutilizável com variantes

import { ButtonHTMLAttributes, ReactNode } from 'react';

// ===========================================
// VARIANTES DO BOTÃO
// ===========================================

type Variante = 'primario' | 'secundario' | 'perigo' | 'fantasma';
type Tamanho = 'pequeno' | 'medio' | 'grande';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variante?: Variante;
  tamanho?: Tamanho;
  carregando?: boolean;
  larguraTotal?: boolean;
}

// ===========================================
// ESTILOS DAS VARIANTES
// ===========================================

const estilosVariante: Record<Variante, string> = {
  primario: 'bg-[#5b7cfa] hover:bg-[#6f8cff] text-white border border-[#5b7cfa]',
  secundario: 'bg-[#1e1e24] hover:bg-[#28282f] text-zinc-100 border border-[#2a2a32]',
  perigo: 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-400/25',
  fantasma: 'bg-transparent hover:bg-[#28282f] text-zinc-300',
};

const estilosTamanho: Record<Tamanho, string> = {
  pequeno: 'px-3 py-1.5 text-xs',
  medio: 'px-4 py-2 text-sm',
  grande: 'px-5 py-2.5 text-base',
};

// ===========================================
// COMPONENTE
// ===========================================

export function Button({
  children,
  variante = 'primario',
  tamanho = 'medio',
  carregando = false,
  larguraTotal = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-full font-medium transition-colors duration-150
        focus:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${estilosVariante[variante]}
        ${estilosTamanho[tamanho]}
        ${larguraTotal ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || carregando}
      {...props}
    >
      {carregando && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
