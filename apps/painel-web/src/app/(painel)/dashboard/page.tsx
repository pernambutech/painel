'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, CircleCheck, CirclePause, CircleX, Cloud, FolderOpen, Monitor, Plus, Server, WifiOff } from 'lucide-react';
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
    { rotulo: 'Projetos ativos', valor: '—', icone: FolderOpen, cor: 'text-[#8ca2ff]', detalhe: 'Módulo em preparação' },
    { rotulo: 'Serviços online', valor: '—', icone: CircleCheck, cor: 'text-emerald-300', detalhe: 'Módulo em preparação' },
    { rotulo: 'Serviços parados', valor: '—', icone: CirclePause, cor: 'text-amber-300', detalhe: 'Módulo em preparação' },
    { rotulo: 'Com erro', valor: '—', icone: CircleX, cor: 'text-red-300', detalhe: 'Sem dados de execução' },
    { rotulo: 'Ambientes online', valor: carregando ? '—' : resumo.conectados, icone: Cloud, cor: 'text-emerald-300', detalhe: carregando ? 'Carregando' : `de ${ambientes.length} cadastrados` },
  ];

  const ambientesAtencao = ambientes.filter((ambiente) => ambiente.agente && ambiente.agente.status !== 'online');

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-zinc-100">Visão geral</h1>
          <p className="mt-1 text-sm text-zinc-400">Olá, {usuario?.nome?.split(' ')[0] || 'usuário'}. Todos os seus projetos e serviços em um só lugar.</p>
        </div>
        <Link href="/ambientes/novo" className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#5b7cfa] bg-[#5b7cfa] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6f8cff]">
          <Plus className="h-4 w-4" /> Novo ambiente
        </Link>
      </header>

      <section aria-label="Resumo operacional" className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        {estatisticas.map(({ rotulo, valor, icone: Icone, cor, detalhe }) => (
          <Card key={rotulo} padding="nenhum" className="p-4 sm:p-[18px]">
            <div className="flex items-start justify-between gap-3"><p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">{rotulo}</p><Icone className={`h-4 w-4 ${cor}`} /></div>
            <p className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-zinc-100">{valor}</p>
            <p className="mt-1 text-xs text-zinc-500">{detalhe}</p>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-300" /><h2 className="text-base font-semibold text-zinc-100">Serviços que precisam de atenção</h2><span className="text-sm text-zinc-500">({ambientesAtencao.length})</span></div>
        <Card padding="nenhum" className="overflow-hidden">
          {ambientesAtencao.length > 0 ? ambientesAtencao.map((ambiente) => (
            <Link key={ambiente.id} href={`/ambientes/${ambiente.id}`} className="flex flex-wrap items-center gap-3 border-b border-[#2a2a32] px-5 py-3.5 last:border-0 hover:bg-[#28282f] sm:gap-5"><WifiOff className="h-4 w-4 shrink-0 text-red-300" /><div className="min-w-0 flex-1"><span className="font-medium text-zinc-100">{ambiente.nome}</span><span className="ml-2 text-sm text-zinc-500">Agente desconectado</span></div><span className="rounded-full border border-[#2a2a32] bg-[#1e1e24] px-3 py-1 text-xs text-zinc-300">Ver detalhes</span></Link>
          )) : <div className="flex items-center gap-3 px-5 py-4 text-sm text-zinc-500"><CircleCheck className="h-4 w-4 text-emerald-300" /> Nenhum ambiente precisa de atenção.</div>}
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card padding="nenhum" className="overflow-hidden"><div className="border-b border-[#2a2a32] px-5 py-4"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-[#8ca2ff]" /><h2 className="text-base font-semibold text-zinc-100">Atividade recente</h2></div><p className="mt-1 text-xs text-zinc-500">Ações da operação aparecerão aqui.</p></div><div className="flex min-h-52 flex-col items-center justify-center px-5 text-center"><Activity className="mb-3 h-8 w-8 text-zinc-700" /><p className="text-sm text-zinc-400">Ainda não há atividades registradas.</p><p className="mt-1 text-xs text-zinc-600">O histórico será alimentado pelas execuções dos serviços.</p></div></Card>
        <Card padding="nenhum" className="overflow-hidden"><div className="flex items-center justify-between border-b border-[#2a2a32] px-5 py-4"><div><h2 className="text-base font-semibold text-zinc-100">Resumo dos ambientes</h2><p className="mt-1 text-xs text-zinc-500">Máquinas e servidores conectados</p></div><Link href="/ambientes" className="text-xs font-medium text-[#8ca2ff] hover:text-white">Ver todos</Link></div>{ambientes.length > 0 ? ambientes.slice(0, 4).map((ambiente) => { const conectado = ambiente.agente?.status === 'online'; return <Link key={ambiente.id} href={`/ambientes/${ambiente.id}`} className="flex items-center gap-3 border-b border-[#2a2a32] px-5 py-3.5 last:border-0 hover:bg-[#28282f]"><span className={`h-2 w-2 rounded-full ${conectado ? 'bg-emerald-300' : 'bg-red-300'}`} /><span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-200">{ambiente.nome}</span><span className={`text-xs font-medium ${conectado ? 'text-emerald-300' : 'text-red-300'}`}>{conectado ? 'ONLINE' : 'OFFLINE'}</span></Link>; }) : <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center"><Monitor className="mb-3 h-8 w-8 text-zinc-700" /><p className="text-sm text-zinc-400">Nenhum ambiente cadastrado.</p><Link href="/ambientes/novo" className="mt-2 text-xs font-medium text-[#8ca2ff]">Adicionar ambiente</Link></div>}</Card>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2"><FolderOpen className="h-4 w-4 text-[#8ca2ff]" /><h2 className="text-base font-semibold text-zinc-100">Projetos recentes</h2></div>
        <Card padding="nenhum" className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-left text-[13px]"><thead className="bg-[#1e1e24] text-[11px] uppercase tracking-[0.08em] text-zinc-500"><tr><th className="px-5 py-3 font-medium">Projeto</th><th className="px-5 py-3 font-medium">Serviços</th><th className="px-5 py-3 font-medium">Ambiente</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Última atividade</th></tr></thead><tbody><tr><td colSpan={5} className="px-5 py-10 text-center text-zinc-500"><Server className="mx-auto mb-2 h-6 w-6 text-zinc-700" />O módulo de projetos será conectado nesta etapa.</td></tr></tbody></table></Card>
      </section>
    </div>
  );
}
