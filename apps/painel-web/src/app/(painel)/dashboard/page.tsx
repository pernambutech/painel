'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, FolderKanban, Monitor, Plus, Server, Wifi, WifiOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/hooks/useAuth';
import { ambientesApi } from '@/lib/api';
import type { Ambiente } from '@/types';

export default function DashboardPage() {
  const { usuario, organizacao } = useAuth();
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!organizacao) return;
    ambientesApi.listar(organizacao.id).then((dados) => setAmbientes(dados || [])).catch(() => setAmbientes([])).finally(() => setCarregando(false));
  }, [organizacao]);

  const resumo = useMemo(() => ({
    conectados: ambientes.filter((ambiente) => ambiente.agente?.status === 'online').length,
    offline: ambientes.filter((ambiente) => ambiente.agente && ambiente.agente.status !== 'online').length,
  }), [ambientes]);

  const estatisticas = [
    { rotulo: 'Projetos ativos', valor: '—', icone: FolderKanban, cor: 'text-[#7f98ff]', detalhe: 'Em breve' },
    { rotulo: 'Serviços online', valor: '—', icone: Server, cor: 'text-emerald-300', detalhe: 'Em breve' },
    { rotulo: 'Serviços parados', valor: '—', icone: Server, cor: 'text-amber-300', detalhe: 'Em breve' },
    { rotulo: 'Ambientes online', valor: carregando ? '—' : resumo.conectados, icone: Monitor, cor: 'text-emerald-300', detalhe: carregando ? 'Carregando' : `${ambientes.length} cadastrados` },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-[#7f98ff]">Centro de controle</p>
          <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-zinc-100">Visão geral</h1>
          <p className="mt-1 text-sm text-zinc-400">Olá, {usuario?.nome?.split(' ')[0] || 'usuário'}. Veja o estado da sua operação.</p>
        </div>
        <Link href="/ambientes/novo" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#5b7cfa] bg-[#5b7cfa] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6f8cff]">
          <Plus className="h-4 w-4" /> Novo ambiente
        </Link>
      </header>

      <section aria-label="Resumo operacional" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {estatisticas.map(({ rotulo, valor, icone: Icone, cor, detalhe }) => (
          <Card key={rotulo} padding="nenhum" className="p-4 sm:p-[18px]">
            <div className="flex items-start justify-between gap-3"><p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">{rotulo}</p><Icone className={`h-4 w-4 ${cor}`} /></div>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-zinc-100">{valor}</p>
            <p className="mt-1 text-xs text-zinc-500">{detalhe}</p>
          </Card>
        ))}
      </section>

      {resumo.offline > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-300" /><h2 className="text-base font-semibold text-zinc-100">Precisa de atenção</h2><span className="text-sm text-zinc-500">{resumo.offline} ambiente{resumo.offline > 1 ? 's' : ''}</span></div>
          <Card padding="nenhum" className="overflow-hidden">
            {ambientes.filter((ambiente) => ambiente.agente && ambiente.agente.status !== 'online').map((ambiente) => (
              <Link key={ambiente.id} href={`/ambientes/${ambiente.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#28282f]"><WifiOff className="h-4 w-4 shrink-0 text-zinc-500" /><div className="min-w-0 flex-1"><p className="font-medium text-zinc-100">{ambiente.nome}</p><p className="text-xs text-zinc-500">Agente desconectado</p></div><span className="rounded-full border border-zinc-700 bg-[#1e1e24] px-2.5 py-1 text-xs text-zinc-300">Ver ambiente</span></Link>
            ))}
          </Card>
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-2">
        <Card padding="nenhum" className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#2a2a32] px-5 py-4"><div><h2 className="text-base font-semibold text-zinc-100">Ambientes</h2><p className="mt-0.5 text-xs text-zinc-500">Conexão das suas máquinas</p></div><Link href="/ambientes" className="text-xs font-medium text-[#8ca2ff] hover:text-white">Ver todos</Link></div>
          {ambientes.length > 0 ? ambientes.slice(0, 4).map((ambiente) => {
            const conectado = ambiente.agente?.status === 'online';
            return <Link key={ambiente.id} href={`/ambientes/${ambiente.id}`} className="flex items-center gap-3 border-b border-[#2a2a32] px-5 py-3.5 last:border-0 hover:bg-[#28282f]">{conectado ? <Wifi className="h-4 w-4 text-emerald-300" /> : <WifiOff className="h-4 w-4 text-zinc-500" />}<span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-200">{ambiente.nome}</span><span className={`text-xs ${conectado ? 'text-emerald-300' : 'text-zinc-500'}`}>{conectado ? 'Conectado' : ambiente.agente ? 'Desconectado' : 'Sem agente'}</span></Link>;
          }) : <div className="px-5 py-10 text-center"><Monitor className="mx-auto mb-3 h-8 w-8 text-zinc-700" /><p className="text-sm text-zinc-400">Nenhum ambiente conectado.</p><Link href="/ambientes/novo" className="mt-2 inline-block text-xs font-medium text-[#8ca2ff]">Adicionar ambiente</Link></div>}
        </Card>
        <Card padding="nenhum" className="overflow-hidden"><div className="border-b border-[#2a2a32] px-5 py-4"><h2 className="text-base font-semibold text-zinc-100">Atividade recente</h2><p className="mt-0.5 text-xs text-zinc-500">Eventos serão exibidos aqui.</p></div><div className="flex min-h-48 flex-col items-center justify-center px-5 text-center"><Server className="mb-3 h-8 w-8 text-zinc-700" /><p className="text-sm text-zinc-400">Ainda não há atividades registradas.</p><p className="mt-1 text-xs text-zinc-600">Ações em ambientes aparecerão nesta linha do tempo.</p></div></Card>
      </section>
    </div>
  );
}
