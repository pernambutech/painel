'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, History, Play, RotateCw, Server, Square, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { BadgeSimples } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { execucoesApi } from '@/lib/api';
import type { Execucao } from '@/types';

const icones: Record<string, any> = { iniciar: Play, parar: Square, reiniciar: RotateCw };

export default function ExecucoesPage() {
  const { organizacao } = useAuth();
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = async () => {
    if (!organizacao) return;
    try { setCarregando(true); setErro(''); setExecucoes(await execucoesApi.listarPorOrganizacao(organizacao.id, 100)); }
    catch { setErro('Não foi possível carregar as execuções.'); }
    finally { setCarregando(false); }
  };
  useEffect(() => { carregar(); }, [organizacao]);

  const data = (valor: string) => new Date(valor).toLocaleString('pt-BR');
  const variante = (status: string) => status === 'sucesso' ? 'online' : status === 'falhou' ? 'erro' : status === 'pendente' ? 'aviso' : 'neutro';

  return <div className="mx-auto max-w-[1400px] space-y-7"><header className="flex items-end justify-between"><div><h1 className="text-[26px] font-semibold tracking-[-0.04em] text-zinc-100">Execuções</h1><p className="mt-1 text-sm text-zinc-400">Acompanhe as ações da operação.</p></div><Button variante="fantasma" tamanho="pequeno" onClick={carregar}><History className="h-4 w-4" />Atualizar</Button></header><Card padding="nenhum" className="overflow-hidden"><div className="border-b border-[#2a2a32] px-5 py-4"><div className="flex items-center gap-2"><Play className="h-4 w-4 text-[#8ca2ff]" /><h2 className="text-base font-semibold text-zinc-100">Execuções recentes</h2><span className="text-xs text-zinc-500">({execucoes.length})</span></div></div>{carregando ? <div className="flex min-h-64 items-center justify-center"><Spinner tamanho="grande" /></div> : erro ? <div className="p-8 text-center"><p className="text-sm text-red-400">{erro}</p><Button variante="fantasma" tamanho="pequeno" onClick={carregar} className="mt-3">Tentar novamente</Button></div> : execucoes.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center"><History className="mb-3 h-9 w-9 text-zinc-700" /><p className="text-sm text-zinc-400">Ainda não há execuções registradas.</p></div> : <div className="divide-y divide-[#2a2a32]">{execucoes.map((exec) => { const Icone = icones[exec.acao] || History; const Status = exec.status === 'sucesso' ? CheckCircle2 : exec.status === 'falhou' ? AlertCircle : Clock; return <div key={exec.id} className="flex gap-4 px-5 py-4 hover:bg-[#1e1e24]"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2a2a32] bg-[#1e1e24]"><Icone className="h-4 w-4 text-[#8ca2ff]" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-medium text-zinc-100">{exec.acao}</span><BadgeSimples variante={variante(exec.status) as any}>{exec.status}</BadgeSimples>{exec.servico && <span className="inline-flex items-center gap-1 text-xs text-zinc-400"><Server className="h-3 w-3" />{exec.servico.nome}</span>}{exec.projeto && <span className="text-xs text-zinc-500">• {exec.projeto.nome}</span>}</div><div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500"><span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{exec.usuario?.nome || '—'}</span><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{data(exec.criadoEm)}</span>{exec.ambiente && <span>Ambiente: {exec.ambiente.nome}</span>}</div>{exec.erro && <p className="mt-2 rounded bg-red-500/10 px-2 py-1 text-xs text-red-300">{exec.erro}</p>}</div><Status className={`h-4 w-4 shrink-0 ${exec.status === 'sucesso' ? 'text-emerald-400' : exec.status === 'falhou' ? 'text-red-400' : 'text-amber-400'}`} /></div>; })}</div>}</Card></div>;
}
