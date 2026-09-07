'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  Bot,
  CircleCheck,
  CirclePause,
  CircleX,
  Cloud,
  FolderOpen,
  Monitor,
  Plus,
  Server,
  WifiOff,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { AttentionList } from '@/components/ui/AttentionList';
import { StatusBadgeTabela } from '@/components/ui/StatusBadgeTabela';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSocket } from '@/lib/hooks/useSocket';
import { useExecutarAcao } from '@/lib/hooks/useExecutarAcao';
import { ambientesApi, dashboardApi, execucoesApi } from '@/lib/api';
import { agentesApi } from '@/lib/api';
import { obterLabelServico } from '@/lib/constantes';
import type { Ambiente, Execucao } from '@/types';

interface DadosDashboard {
  totalProjetos: number;
  projetos: { id: string; nome: string; criadoEm: string }[];
  totalServicos: number;
  servicosOnline: number;
  servicosParados: number;
  servicosComErro: number;
  servicos: {
    id: string;
    nome: string;
    tipo: string;
    porta: number | null;
    projetoId: string;
    ambienteId: string | null;
    statusPm2: string;
  }[];
}

export default function DashboardPage() {
  const { usuario, organizacao } = useAuth();
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [dashboard, setDashboard] = useState<DadosDashboard | null>(null);
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoExecucoes, setCarregandoExecucoes] = useState(true);
  const [erroDashboard, setErroDashboard] = useState('');

  // Função para carregar dados do dashboard
  const carregarDados = useCallback(async () => {
    if (!organizacao) return;

    try {
      const [ambientesDados, dashboardDados] = await Promise.all([
        ambientesApi.listar(organizacao.id),
        dashboardApi.obterDados(organizacao.id),
      ]);

      setAmbientes(ambientesDados || []);
      setDashboard(dashboardDados);
      setErroDashboard('');
    } catch {
      setErroDashboard('Erro ao carregar dados do dashboard. Verifique se a API está acessível.');
    }
  }, [organizacao]);

  const carregarExecucoes = useCallback(async () => {
    if (!organizacao) return;

    try {
      const resposta = await execucoesApi.listarPorOrganizacao(organizacao.id, 10);
      setExecucoes(resposta.dados || []);
    } catch {
      // Erro silencioso para execucoes (não crítico)
    }
  }, [organizacao]);

  // Carregar dados iniciais
  useEffect(() => {
    if (!organizacao) return;

    carregarDados().finally(() => setCarregando(false));
    carregarExecucoes().finally(() => setCarregandoExecucoes(false));
  }, [organizacao, carregarDados, carregarExecucoes]);

  // WebSocket para atualizações em tempo real
  useSocket({
    onStatusAgente: () => {
      // Quando um agente muda de status, recarregar dados
      carregarDados();
    },
    onDashboardAtualizado: () => {
      carregarDados();
      carregarExecucoes();
    },
  });

  // Hook para ações de serviço (Iniciar/Parar/Reiniciar)
  const { executar, carregando: carregandoAcao } = useExecutarAcao();

  // Polling como fallback: atualizar a cada 15 segundos (respeita preferência)
  useEffect(() => {
    if (!organizacao) return;

    const autoRefresh = localStorage.getItem('preferencia_atualizacao_automatica') !== 'false';
    if (!autoRefresh) return;

    const intervalo = setInterval(() => {
      carregarDados();
      carregarExecucoes();
    }, 15000);

    return () => clearInterval(intervalo);
  }, [organizacao, carregarDados, carregarExecucoes]);

  const resumoAmbientes = useMemo(
    () => ({
      conectados: ambientes.filter((a) => a.agente?.status === 'online').length,
      offline: ambientes.filter((a) => a.agente && a.agente.status !== 'online').length,
    }),
    [ambientes],
  );

  const estatisticas: {
    rotulo: string;
    valor: number | string;
    icone: typeof Activity;
    cor: string;
    detalhe: string;
    href?: string;
  }[] = [
    {
      rotulo: 'Projetos ativos',
      valor: carregando ? '—' : (dashboard?.totalProjetos ?? 0),
      icone: FolderOpen,
      cor: 'text-[#8ca2ff]',
      detalhe: 'Projetos cadastrados',
      href: '/projetos',
    },
    {
      rotulo: 'Serviços online',
      valor: carregando ? '—' : (dashboard?.servicosOnline ?? 0),
      icone: CircleCheck,
      cor: 'text-emerald-300',
      detalhe: 'Processos ativos no PM2',
      href: '/servicos?status=online',
    },
    {
      rotulo: 'Serviços parados',
      valor: carregando ? '—' : (dashboard?.servicosParados ?? 0),
      icone: CirclePause,
      cor: 'text-amber-300',
      detalhe: 'Processos parados',
      href: '/servicos?status=stopped',
    },
    {
      rotulo: 'Com erro',
      valor: carregando ? '—' : (dashboard?.servicosComErro ?? 0),
      icone: CircleX,
      cor: 'text-red-300',
      detalhe: 'Processos com erro',
      href: '/servicos?status=erro',
    },
    {
      rotulo: 'Ambientes online',
      valor: carregando ? '—' : resumoAmbientes.conectados,
      icone: Cloud,
      cor: 'text-emerald-300',
      detalhe: carregando ? 'Carregando' : `de ${ambientes.length} cadastrados`,
      href: '/ambientes',
    },
  ];

  const ambientesAtencao = ambientes.filter((a) => a.agente && a.agente.status !== 'online');

  // Mapeamento de ícones por tipo de serviço
  const iconesPorTipo: Record<string, typeof Server> = {
    frontend: Monitor,
    backend: Server,
    api: Zap,
    worker: Server,
    bot: Bot,
    custom: Server,
  };

  // Serviços que precisam de atenção (errored ou stopped)
  const servicosAtencao = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.servicos
      .filter((s) => s.statusPm2 === 'errored' || s.statusPm2 === 'stopped')
      .map((s) => {
        const projeto = dashboard.projetos.find((p) => p.id === s.projetoId);
        const icone = iconesPorTipo[s.tipo] || Server;
        const isErro = s.statusPm2 === 'errored';
        return {
          icone,
          titulo: s.nome,
          subtitulo: `· ${obterLabelServico(s.tipo)} — ${projeto?.nome || '—'}`,
          badgeVariante: isErro ? ('erro' as const) : ('aviso' as const),
          badgeTexto: isErro ? 'Erro' : 'Parado',
          botaoSecundario: {
            texto: 'Ver detalhes',
            href: `/servicos/${s.id}`,
          },
          botaoPrimario: {
            texto: isErro ? 'Reiniciar' : 'Iniciar',
            onClick: () => {
              if (organizacao) {
                executar(organizacao.id, s.projetoId, s.id, isErro ? 'reiniciar' : 'iniciar');
              }
            },
            acao: isErro ? ('reiniciar' as const) : ('iniciar' as const),
          },
          loading: carregandoAcao,
        };
      });
  }, [dashboard, organizacao, executar, carregandoAcao]);

  // Ambientes que precisam de atenção (agente offline)
  const ambientesAtencaoLista = useMemo(() => {
    return ambientesAtencao.map((ambiente) => ({
      icone: WifiOff,
      titulo: ambiente.nome,
      subtitulo: '· Agente desconectado',
      badgeVariante: 'aviso' as const,
      badgeTexto: 'Offline',
      botaoSecundario: {
        texto: 'Ver detalhes',
        href: `/ambientes/${ambiente.id}`,
      },
      botaoPrimario: {
        texto: 'Reconectar',
        onClick: () => {
          // Enviar comando OBTER_STATUS ao agente via API
          if (organizacao && ambiente.agente?.id) {
            agentesApi.enviarComando
              ? agentesApi.enviarComando(organizacao.id, ambiente.agente.id, { tipo: 'OBTER_STATUS' })
              : Promise.resolve();
          }
        },
        acao: 'reiniciar' as const,
      },
      loading: false,
    }));
  }, [ambientesAtencao, organizacao]);

  // Dados agregados para a tabela de projetos (híbrida)
  const linhasTabelaProjetos = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.projetos.map((projeto) => {
      const servicosProjeto = dashboard.servicos.filter((s) => s.projetoId === projeto.id);
      const qtdServicos = servicosProjeto.length;

      // Primeiro ambiente associado a um serviço do projeto
      const ambienteId = servicosProjeto.find((s) => s.ambienteId)?.ambienteId || null;
      const ambiente = ambienteId
        ? ambientes.find((a) => a.id === ambienteId)
        : null;

      // Status derivado do PM2
      const temErro = servicosProjeto.some((s) => s.statusPm2 === 'errored');
      const temParado = servicosProjeto.some((s) => s.statusPm2 === 'stopped');
      const todosOnline = servicosProjeto.length > 0 && servicosProjeto.every((s) => s.statusPm2 === 'online');

      let status: 'online' | 'atencao' | 'erro' = 'online';
      let statusLabel = 'Online';
      if (temErro) {
        status = 'erro';
        statusLabel = 'Erro';
      } else if (temParado || !todosOnline) {
        status = 'atencao';
        statusLabel = 'Atenção';
      }

      // Última atividade deste projeto
      const ultimaExecucao = execucoes.find((e) => e.projetoId === projeto.id);
      const ultimaAtividade = ultimaExecucao
        ? new Date(ultimaExecucao.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : '—';

      return {
        id: projeto.id,
        nome: projeto.nome,
        qtdServicos,
        ambiente: ambiente?.nome || '—',
        status,
        statusLabel,
        ultimaAtividade,
      };
    });
  }, [dashboard, ambientes, execucoes]);

  const nomeAcao = (acao: string) => {
    const mapa: Record<string, string> = {
      INICIAR: 'Iniciou',
      PARAR: 'Parou',
      REINICIAR: 'Reiniciou',
      ATUALIZAR: 'Atualizou',
      GIT_PULL: 'Git pull',
      CRIAR: 'Criou',
    };
    return mapa[acao] || acao;
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'sucesso':
        return <Badge variante="online">Sucesso</Badge>;
      case 'falhou':
        return <Badge variante="erro">Falhou</Badge>;
      case 'executando':
        return <Badge variante="aviso">Executando</Badge>;
      default:
        return <Badge variante="neutro">Pendente</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">
            Visão geral
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Olá, {usuario?.nome?.split(' ')[0] || 'usuário'}. Todos os seus projetos e serviços
            em um só lugar.
          </p>
        </div>
        <Link
          href="/ambientes/novo"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#5b7cfa] bg-[#5b7cfa] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6f8cff]"
        >
          <Plus className="h-4 w-4" /> Novo ambiente
        </Link>
      </header>

      {/* Erro de carregamento */}
      {erroDashboard && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-400">{erroDashboard}</p>
            <p className="text-xs text-red-400/70 mt-1">Verifique se a API Central está rodando na porta 4001.</p>
          </div>
          <Button variante="fantasma" tamanho="pequeno" onClick={() => { setErroDashboard(''); setCarregando(true); carregarDados().finally(() => setCarregando(false)); }}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Cards de estatísticas */}
      <section aria-label="Resumo operacional" className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        {estatisticas.map(({ rotulo, valor, icone: Icone, cor, detalhe, href }) => {
          const Conteudo = (
            <>
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
                  {rotulo}
                </p>
                <Icone className={`h-4 w-4 ${cor}`} />
              </div>
              <p className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-zinc-100">
                {valor}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{detalhe}</p>
            </>
          );

          if (href) {
            return (
              <Link key={rotulo} href={href}>
                <Card padding="nenhum" className="p-4 sm:p-[18px] transition-colors hover:border-[#3a3a46]/40 cursor-pointer">
                  {Conteudo}
                </Card>
              </Link>
            );
          }

          return (
            <Card
              key={rotulo}
              padding="nenhum"
              className="p-4 sm:p-[18px] transition-colors hover:border-[#3a3a46]/40"
            >
              {Conteudo}
            </Card>
          );
        })}
      </section>

      {/* Serviços que precisam de atenção */}
      <AttentionList
        titulo="Serviços que precisam de atenção"
        icone={<AlertTriangle className="h-4 w-4 text-amber-300" />}
        contador={servicosAtencao.length}
        itens={servicosAtencao}
        vazia={
          <div className="flex items-center gap-3 px-5 py-4 text-sm text-zinc-500">
            <CircleCheck className="h-4 w-4 text-emerald-300" /> Nenhum serviço com problema.
          </div>
        }
      />

      {/* Ambientes que precisam de atenção */}
      <AttentionList
        titulo="Ambientes que precisam de atenção"
        icone={<WifiOff className="h-4 w-4 text-red-300" />}
        contador={ambientesAtencaoLista.length}
        itens={ambientesAtencaoLista}
        vazia={
          <div className="flex items-center gap-3 px-5 py-4 text-sm text-zinc-500">
            <CircleCheck className="h-4 w-4 text-emerald-300" /> Todos os ambientes estão online.
          </div>
        }
      />

      {/* Atividade recente + Resumo dos ambientes */}
      <section className="grid gap-5 lg:grid-cols-2">
        {/* Atividade recente */}
        <Card padding="nenhum" className="overflow-hidden">
          <div className="border-b border-[#2a2a32] px-5 py-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#8ca2ff]" />
              <h2 className="text-base font-semibold text-zinc-100">Atividade recente</h2>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Últimas ações executadas na plataforma.</p>
          </div>
          {carregandoExecucoes ? (
            <div className="flex min-h-52 items-center justify-center">
              <Spinner tamanho="medio" />
            </div>
          ) : execucoes.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              {execucoes.map((exec) => (
                <div
                  key={exec.id}
                  className="flex items-center gap-3 border-b border-[#2a2a32] px-5 py-3 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-200">
                      <span className="font-medium">{nomeAcao(exec.acao)}</span>
                      {exec.servico?.nome && (
                        <span className="text-zinc-400"> {exec.servico.nome}</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {exec.usuario?.nome || 'Sistema'} •{' '}
                      {new Date(exec.criadoEm).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  {statusBadge(exec.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
              <Activity className="mb-3 h-8 w-8 text-zinc-700" />
              <p className="text-sm text-zinc-400">Nenhuma atividade registrada.</p>
              <p className="mt-1 text-xs text-zinc-600">
                O histórico será alimentado pelas execuções dos serviços.
              </p>
            </div>
          )}
        </Card>

        {/* Resumo dos ambientes */}
        <Card padding="nenhum" className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#2a2a32] px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Resumo dos ambientes</h2>
              <p className="mt-1 text-xs text-zinc-500">Máquinas e servidores conectados</p>
            </div>
            <Link href="/ambientes" className="text-xs font-medium text-[#8ca2ff] hover:text-white">
              Ver todos
            </Link>
          </div>
          {ambientes.length > 0 ? (
            ambientes.slice(0, 5).map((ambiente) => {
              const conectado = ambiente.agente?.status === 'online';
              return (
                <Link
                  key={ambiente.id}
                  href={`/ambientes/${ambiente.id}`}
                  className="flex items-center gap-3 border-b border-[#2a2a32] px-5 py-3.5 last:border-0 hover:bg-[#28282f]"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${conectado ? 'bg-emerald-300' : 'bg-red-300'}`}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-200">
                    {ambiente.nome}
                  </span>
                  <span
                    className={`text-xs font-medium ${conectado ? 'text-emerald-300' : 'text-red-300'}`}
                  >
                    {conectado ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </Link>
              );
            })
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
              <Monitor className="mb-3 h-8 w-8 text-zinc-700" />
              <p className="text-sm text-zinc-400">Nenhum ambiente cadastrado.</p>
              <Link href="/ambientes/novo" className="mt-2 text-xs font-medium text-[#8ca2ff]">
                Adicionar ambiente
              </Link>
            </div>
          )}
        </Card>
      </section>

      {/* Tabela de projetos com serviços */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-[#8ca2ff]" />
          <h2 className="text-base font-semibold text-zinc-100">Projetos</h2>
        </div>
        <Card padding="nenhum" className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-[13px]">
            <thead className="bg-[#1e1e24] text-[11px] uppercase tracking-[0.08em] text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-medium">Projeto</th>
                <th className="px-5 py-3 font-medium">Serviços</th>
                <th className="px-5 py-3 font-medium">Ambiente</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Última atividade</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-zinc-500">
                    <Spinner tamanho="pequeno" />
                  </td>
                </tr>
              ) : linhasTabelaProjetos.length > 0 ? (
                linhasTabelaProjetos.map((linha) => (
                  <tr
                    key={linha.id}
                    className="border-b border-[#2a2a32] hover:bg-[#1e1e24] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/projetos/${linha.id}`}
                        className="font-medium text-zinc-200 hover:text-[#8ca2ff] transition-colors"
                      >
                        {linha.nome}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-zinc-400">{linha.qtdServicos}</td>
                    <td className="px-5 py-3 text-zinc-400">{linha.ambiente}</td>
                    <td className="px-5 py-3">
                      <StatusBadgeTabela variante={linha.status}>
                        {linha.statusLabel}
                      </StatusBadgeTabela>
                    </td>
                    <td className="px-5 py-3 text-zinc-500">{linha.ultimaAtividade}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-zinc-500">
                    <Server className="mx-auto mb-2 h-6 w-6 text-zinc-700" />
                    Nenhum projeto cadastrado.
                    <br />
                    <Link
                      href="/projetos/novo"
                      className="mt-2 inline-block text-xs font-medium text-[#8ca2ff]"
                    >
                      Criar projeto
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
