// Componente Modal reutilizável
// Suporta: focus trap, ESC, aria, bloqueio de scroll, backdrop click

'use client';

import { useEffect, useRef, useCallback, type ReactNode } from 'react';

// ===========================================
// TIPOS
// ===========================================

interface ModalProps {
  /** Se true, o modal está aberto */
  aberto: boolean;
  /** Callback chamado ao fechar o modal */
  aoFechar: () => void;
  /** Conteúdo do modal */
  children: ReactNode;
  /** Largura máxima do modal (padrão: max-w-md) */
  larguraMaxima?: string;
  /** Se true, não fecha ao clicar no backdrop (padrão: false) */
  naoFecharBackdrop?: boolean;
  /** Título do modal para aria-label */
  titulo?: string;
}

// ===========================================
// COMPONENTE
// ===========================================

export function Modal({
  aberto,
  aoFechar,
  children,
  larguraMaxima = 'max-w-md',
  naoFecharBackdrop = false,
  titulo,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const elementoFocoAnterior = useRef<HTMLElement | null>(null);

  // Fechar com ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        aoFechar();
      }

      // Focus trap com Tab
      if (e.key === 'Tab' && modalRef.current) {
        const focaveis = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        const primeiroFocal = focaveis[0];
        const ultimoFocal = focaveis[focaveis.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: se foco no primeiro, ir para o último
          if (document.activeElement === primeiroFocal) {
            e.preventDefault();
            ultimoFocal?.focus();
          }
        } else {
          // Tab: se foco no último, ir para o primeiro
          if (document.activeElement === ultimoFocal) {
            e.preventDefault();
            primeiroFocal?.focus();
          }
        }
      }
    },
    [aoFechar],
  );

  // Bloquear/desbloquear scroll do body
  useEffect(() => {
    if (!aberto) return;

    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [aberto]);

  // Focar no modal ao abrir e restaurar foco ao fechar
  useEffect(() => {
    if (!aberto) {
      if (elementoFocoAnterior.current) {
        elementoFocoAnterior.current.focus();
        elementoFocoAnterior.current = null;
      }
      return;
    }

    elementoFocoAnterior.current = document.activeElement as HTMLElement;
    const timeout = setTimeout(() => {
      modalRef.current?.focus();
    }, 50);

    return () => clearTimeout(timeout);
  }, [aberto]);

  // Adicionar/remover listener de teclado
  useEffect(() => {
    if (!aberto) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [aberto, handleKeyDown]);

  // Não renderizar se fechado
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={(e) => {
        if (!naoFecharBackdrop && e.target === e.currentTarget) {
          aoFechar();
        }
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`w-full ${larguraMaxima} rounded-xl border border-[#2a2a32] bg-[#16161a] p-6 shadow-2xl outline-none`}
      >
        {children}
      </div>
    </div>
  );
}
