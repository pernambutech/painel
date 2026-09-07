// Componente AttentionList
// Wrapper que agrupa itens de atenção com cabeçalho e empty state

import { ReactNode } from 'react';
import { AttentionItem } from './AttentionItem';

// ===========================================
// TIPOS
// ===========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AttentionItemData {
  icone: any;
  titulo: string;
  subtitulo: string;
  badgeVariante: 'online' | 'offline' | 'erro' | 'aviso' | 'neutro';
  badgeTexto: string;
  botaoSecundario: { texto: string; href?: string; onClick?: () => void };
  botaoPrimario: { texto: string; onClick?: () => void; acao?: 'reiniciar' | 'iniciar' | 'parar' };
  loading?: boolean;
}

interface AttentionListProps {
  titulo: string;
  icone: ReactNode;
  contador: number;
  itens: AttentionItemData[];
  vazia?: ReactNode;
}

// ===========================================
// COMPONENTE
// ===========================================

export function AttentionList({
  titulo,
  icone,
  contador,
  itens,
  vazia,
}: AttentionListProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        {icone}
        <h2 className="text-base font-semibold text-zinc-100">{titulo}</h2>
        <span className="text-sm text-zinc-500">({contador})</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {itens.length > 0 ? (
          itens.map((item, index) => (
            <AttentionItem
              key={index}
              icone={item.icone}
              titulo={item.titulo}
              subtitulo={item.subtitulo}
              badgeVariante={item.badgeVariante}
              badgeTexto={item.badgeTexto}
              botaoSecundario={item.botaoSecundario}
              botaoPrimario={item.botaoPrimario}
              loading={item.loading}
            />
          ))
        ) : (
          <div className="rounded-lg border border-[#2a2a32] bg-[#16161a] px-5 py-4">
            {vazia || (
              <p className="text-sm text-zinc-500">Nenhum item precisa de atenção.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
