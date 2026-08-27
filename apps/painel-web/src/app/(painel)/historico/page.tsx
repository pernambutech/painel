// Página de histórico e auditoria
// Placeholder: será conectada ao módulo de histórico em etapa futura

'use client';

import { History } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function HistoricoPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <header>
        <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-zinc-100">Histórico</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Ações executadas na operação, eventos do sistema e auditoria.
        </p>
      </header>

      <Card padding="nenhum" className="overflow-hidden">
        <div className="border-b border-[#2a2a32] px-5 py-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#8ca2ff]" />
            <h2 className="text-base font-semibold text-zinc-100">Linha do tempo</h2>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            O módulo de histórico será conectado nas próximas etapas.
          </p>
        </div>
        <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
          <History className="mb-3 h-8 w-8 text-zinc-700" />
          <p className="text-sm text-zinc-400">Ainda não há eventos registrados.</p>
          <p className="mt-1 text-xs text-zinc-600">
            Execuções de serviços e ações de usuários aparecerão aqui.
          </p>
        </div>
      </Card>
    </div>
  );
}