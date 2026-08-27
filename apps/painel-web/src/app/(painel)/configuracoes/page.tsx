'use client';

import { Settings } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function ConfiguracoesPage() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-7"><header><h1 className="text-[26px] font-semibold tracking-[-0.04em] text-zinc-100">Configurações</h1><p className="mt-1 text-sm text-zinc-400">Preferências da sua conta e organização.</p></header><Card padding="nenhum" className="overflow-hidden"><div className="flex items-center gap-2 border-b border-[#2a2a32] px-5 py-4"><Settings className="h-4 w-4 text-[#8ca2ff]" /><h2 className="text-base font-semibold text-zinc-100">Preferências</h2></div><div className="flex min-h-52 flex-col items-center justify-center px-5 text-center"><Settings className="mb-3 h-9 w-9 text-zinc-700" /><p className="text-sm text-zinc-400">Configurações em preparação.</p><p className="mt-1 text-xs text-zinc-600">As preferências serão conectadas nas próximas etapas.</p></div></Card></div>
  );
}
