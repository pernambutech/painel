// Componente AttentionItem
// Item individual de lista de atenção com ícone, status e ações

'use client';

import Link from 'next/link';
import { Badge } from './Badge';

// ===========================================
// TIPOS
// ===========================================

interface BotaoAcao {
  texto: string;
  onClick?: () => void;
  acao?: 'reiniciar' | 'iniciar' | 'parar';
  href?: string;
}

interface AttentionItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icone: any;
  titulo: string;
  subtitulo: string;
  badgeVariante: 'online' | 'offline' | 'erro' | 'aviso' | 'neutro';
  badgeTexto: string;
  botaoSecundario: BotaoAcao;
  botaoPrimario: BotaoAcao;
  loading?: boolean;
}

// ===========================================
// COMPONENTE
// ===========================================

export function AttentionItem({
  icone: Icone,
  titulo,
  subtitulo,
  badgeVariante,
  badgeTexto,
  botaoSecundario,
  botaoPrimario,
  loading = false,
}: AttentionItemProps) {
  return (
    <div
      className="
        flex flex-col gap-3 rounded-lg border border-[#2a2a32] bg-[#16161a]
        transition-colors duration-150
        hover:border-[#3a3a4a]
        sm:flex-row sm:items-center sm:justify-between
      "
      style={{ padding: '14px 18px', gap: '12px 20px' }}
    >
      {/* Informações do item */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Icone className="h-4 w-4 shrink-0 text-[#8ca2ff]" />
        <span className="text-sm font-medium text-zinc-100">{titulo}</span>
        <span className="hidden sm:inline text-sm text-zinc-500">{subtitulo}</span>
        <span className="sm:hidden text-xs text-zinc-500">{subtitulo}</span>
        <Badge variante={badgeVariante}>{badgeTexto}</Badge>
      </div>

      {/* Botões de ação */}
      <div className="flex items-center gap-2 sm:shrink-0">
        {botaoSecundario.href ? (
          <Link
            href={botaoSecundario.href}
            className="
              rounded-full border border-[#2a2a32] bg-transparent
              px-3.5 py-1.5 text-xs font-medium text-zinc-300
              transition-colors duration-150
              hover:bg-[#28282f] hover:text-zinc-100
            "
          >
            {botaoSecundario.texto}
          </Link>
        ) : (
          <button
            onClick={botaoSecundario.onClick}
            className="
              rounded-full border border-[#2a2a32] bg-transparent
              px-3.5 py-1.5 text-xs font-medium text-zinc-300
              transition-colors duration-150
              hover:bg-[#28282f] hover:text-zinc-100
            "
          >
            {botaoSecundario.texto}
          </button>
        )}

        <button
          onClick={botaoPrimario.onClick}
          disabled={loading}
          className={`
            rounded-full border px-3.5 py-1.5 text-xs font-medium
            transition-colors duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              botaoPrimario.acao === 'reiniciar'
                ? 'border-[#5b7cfa] bg-[#5b7cfa] text-white hover:bg-[#6f8cff]'
                : botaoPrimario.acao === 'iniciar'
                ? 'border-[#3dd68c] bg-[#3dd68c] text-black hover:bg-[#4de69c]'
                : 'border-amber-400 bg-amber-400 text-black hover:bg-amber-300'
            }
          `}
        >
          {loading ? 'Aguarde...' : botaoPrimario.texto}
        </button>
      </div>
    </div>
  );
}
