'use client';

import { FolderOpen, Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function ProjetosPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-7">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-[26px] font-semibold tracking-[-0.04em] text-zinc-100">Projetos</h1><p className="mt-1 text-sm text-zinc-400">Gerencie todos os seus projetos e serviços.</p></div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#5b7cfa] bg-[#5b7cfa] px-4 py-2 text-sm font-medium text-white hover:bg-[#6f8cff]"><Plus className="h-4 w-4" /> Novo projeto</button>
      </header>
      <div className="flex gap-3"><div className="flex flex-1 items-center gap-2 rounded-lg border border-[#2a2a32] bg-[#16161a] px-3 text-zinc-500"><Search className="h-4 w-4" /><input className="w-full bg-transparent py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-600" placeholder="Buscar projeto..." /></div></div>
      <Card padding="nenhum" className="overflow-hidden"><div className="flex min-h-64 flex-col items-center justify-center px-5 text-center"><FolderOpen className="mb-3 h-9 w-9 text-zinc-700" /><h2 className="text-base font-semibold text-zinc-200">Nenhum projeto cadastrado</h2><p className="mt-1 text-sm text-zinc-500">O cadastro de projetos será conectado na próxima etapa.</p></div></Card>
    </div>
  );
}
