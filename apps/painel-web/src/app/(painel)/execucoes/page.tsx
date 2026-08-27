'use client';

import { History, Play } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function ExecucoesPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-7"><header><h1 className="text-[26px] font-semibold tracking-[-0.04em] text-zinc-100">Execuções</h1><p className="mt-1 text-sm text-zinc-400">Acompanhe as ações da operação.</p></header><Card padding="nenhum" className="overflow-hidden"><div className="border-b border-[#2a2a32] px-5 py-4"><div className="flex items-center gap-2"><Play className="h-4 w-4 text-[#8ca2ff]" /><h2 className="text-base font-semibold text-zinc-100">Execuções recentes</h2></div></div><div className="flex min-h-64 flex-col items-center justify-center px-5 text-center"><History className="mb-3 h-9 w-9 text-zinc-700" /><p className="text-sm text-zinc-400">Ainda não há execuções registradas.</p><p className="mt-1 text-xs text-zinc-600">As ações dos serviços aparecerão aqui.</p></div></Card></div>
  );
}
