// Componente Input
// Campo de entrada reutilizável

import { InputHTMLAttributes, forwardRef } from 'react';

// ===========================================
// PROPS DO INPUT
// ===========================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo?: string;
  erro?: string;
  dica?: string;
}

// ===========================================
// COMPONENTE
// ===========================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ rotulo, erro, dica, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {/* Rótulo */}
        {rotulo && (
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">{rotulo}</label>
        )}

        {/* Campo */}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-[#1e1e24] border cor-borda
            text-zinc-100 placeholder-zinc-500
            focus:outline-none focus:border-[#5b7cfa]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150
            ${erro ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Dica */}
        {dica && !erro && <p className="mt-1 text-xs text-zinc-500">{dica}</p>}

        {/* Erro */}
        {erro && <p className="mt-1 text-xs text-red-500">{erro}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
