'use client';

import { Activity, Plus, Server } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function ServicosPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-7">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-[26px] font-semibold tracking-[-0.04em] text-zinc-100">Serviços</h1><p className="mt-1 text-sm text-zinc-400">Visão geral de todos os serviços.</p></div><button className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#5b7cfa] bg-[#5b7cfa] px-4 py-2 text-sm font-medium text-white hover:bg-[#6f8cff]"><Plus className="h-4 w-4" /> Novo serviço</button></header>
      <Card padding="nenhum" className="overflow-hidden"><div className="border-b border-[#2a2a32] px-5 py-4"><div className="flex items-center gap-2"><Server className="h-4 w-4 text-[#8ca2ff]" /><h2 className="text-base font-semibold text-zinc-100">Serviços gerenciados</h2></div><p className="mt-1 text-xs text-zinc-500">Controle processos e acompanhe seus estados.</p></div><div className="flex min-h-64 flex-col items-center justify-center px-5 text-center"><Activity className="mb-3 h-9 w-9 text-zinc-700" /><p className="text-sm text-zinc-400">Nenhum serviço cadastrado.</p><p className="mt-1 text-xs text-zinc-600">O módulo de serviços será conectado na próxima etapa.</p></div></Card>
    </div>
  );
}
