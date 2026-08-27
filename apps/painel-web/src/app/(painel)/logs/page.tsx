'use client';

import { FileText, Terminal } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function LogsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-7"><header><h1 className="text-[26px] font-semibold tracking-[-0.04em] text-zinc-100">Logs</h1><p className="mt-1 text-sm text-zinc-400">Visualize os logs dos serviços.</p></header><Card padding="nenhum" className="overflow-hidden"><div className="flex items-center gap-2 border-b border-[#2a2a32] px-5 py-4"><FileText className="h-4 w-4 text-[#8ca2ff]" /><h2 className="text-base font-semibold text-zinc-100">Saída dos serviços</h2></div><div className="flex min-h-64 flex-col items-center justify-center bg-[#0a0a0e] px-5 text-center"><Terminal className="mb-3 h-9 w-9 text-zinc-700" /><p className="text-sm text-zinc-400">Nenhum log disponível.</p><p className="mt-1 text-xs text-zinc-600">Os logs serão exibidos quando houver serviços em execução.</p></div></Card></div>
  );
}
