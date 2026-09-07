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
  Server,
  WifiOff,
  Zap,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { AttentionItem } from '@/components/ui/AttentionItem';
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
  const { organizacao } = useAuth();
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

  return (
    <div style={{ padding: '28px 32px 40px' }}>
      {/* Cabeçalho */}
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.4px' }} className="text-zinc-100">
          Visão Geral
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#a8a8b3' }}>
          Todos os seus projetos e serviços em um só lugar.
        </p>
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
      <section aria-label="Resumo operacional" className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', marginBottom: '32px' }}>
        {estatisticas.map(({ rotulo, valor, icone: Icone, cor, detalhe, href }) => {
          const Conteudo = (
            <>
              <div className="flex items-center gap-1.5">
                <Icone className={`h-3.5 w-3.5 ${cor}`} />
                <p className="text-xs font-medium uppercase" style={{ letterSpacing: '0.4px', color: '#6e6e7a' }}>
                  {rotulo}
                </p>
              </div>
              <p className="font-semibold text-zinc-100" style={{ fontSize: '28px', marginTop: '6px', letterSpacing: '-0.3px' }}>
                {valor} <span className="text-base font-normal" style={{ color: '#6e6e7a', marginLeft: '6px' }}>{detalhe.replace('Projetos cadastrados', 'ativos').replace('Processos ativos no PM2', '').replace('Processos parados', '').replace('Processos com erro', '').replace('cadastrados', '')}</span>
              </p>
            </>
          );

          if (href) {
            return (
              <Link key={rotulo} href={href}>
                <div className="rounded-xl border border-[#2a2a32] bg-[#16161a] p-4 transition-colors hover:border-[#3a3a46] cursor-pointer">
                  {Conteudo}
                </div>
              </Link>
            );
          }

          return (
            <div key={rotulo} className="rounded-xl border border-[#2a2a32] bg-[#16161a] p-4 transition-colors hover:border-[#3a3a46]">
              {Conteudo}
            </div>
          );
        })}
      </section>

      {/* Serviços que precisam de atenção */}
      <section style={{ marginBottom: '32px' }}>
        <h2 className="flex items-center gap-2.5 text-base font-semibold mb-3.5" style={{ color: '#ececf0' }}>
          <AlertTriangle className="h-4 w-4" style={{ color: '#fbbf24' }} />
          <span>Serviços que precisam de atenção</span>
          <span className="text-sm font-normal" style={{ color: '#6e6e7a' }}>({servicosAtencao.length})</span>
        </h2>
        {servicosAtencao.length > 0 ? (
          <div className="flex flex-col" style={{ gap: '10px' }}>
            {servicosAtencao.map((item, index) => (
              <AttentionItem
                key={index}
                icone={item.icone}
                titulo={item.titulo}
                subtitulo={item.subtitulo}
                badgeVariante={item.badgeVariante}
                badgeTexto={item.badgeTexto}
                botaoSecundario={item.botaoSecundario}
                botaoPrimario={item.botaoPrimario}
                loading={item.loading}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#2a2a32] bg-[#16161a] flex items-center gap-3" style={{ padding: '14px 18px', fontSize: '13px' }}>
            <CircleCheck className="h-4 w-4 shrink-0" style={{ color: '#3dd68c' }} />
            <span style={{ color: '#6e6e7a' }}>Nenhum serviço com problema.</span>
          </div>
        )}
      </section>

      {/* Ambientes que precisam de atenção */}
      <section style={{ marginBottom: '32px' }}>
        <h2 className="flex items-center gap-2.5 text-base font-semibold mb-3.5" style={{ color: '#ececf0' }}>
          <WifiOff className="h-4 w-4" style={{ color: '#f87171' }} />
          <span>Ambientes que precisam de atenção</span>
          <span className="text-sm font-normal" style={{ color: '#6e6e7a' }}>({ambientesAtencaoLista.length})</span>
        </h2>
        {ambientesAtencaoLista.length > 0 ? (
          <div className="flex flex-col" style={{ gap: '10px' }}>
            {ambientesAtencaoLista.map((item, index) => (
              <AttentionItem
                key={index}
                icone={item.icone}
                titulo={item.titulo}
                subtitulo={item.subtitulo}
                badgeVariante={item.badgeVariante}
                badgeTexto={item.badgeTexto}
                botaoSecundario={item.botaoSecundario}
                botaoPrimario={item.botaoPrimario}
                loading={item.loading}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#2a2a32] bg-[#16161a] flex items-center gap-3" style={{ padding: '14px 18px', fontSize: '13px' }}>
            <CircleCheck className="h-4 w-4 shrink-0" style={{ color: '#3dd68c' }} />
            <span style={{ color: '#6e6e7a' }}>Todos os ambientes estão online.</span>
          </div>
        )}
      </section>

      {/* Atividade recente + Resumo dos ambientes */}
      <section className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '32px' }}>
        {/* Atividade recente */}
        <div className="rounded-xl border border-[#2a2a32] bg-[#16161a]" style={{ padding: '16px 18px' }}>
          <div className="font-semibold text-sm mb-3" style={{ color: '#ececf0' }}>🕒 Atividade recente</div>
          {carregandoExecucoes ? (
            <div className="flex min-h-52 items-center justify-center">
              <Spinner tamanho="medio" />
            </div>
          ) : execucoes.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              {execucoes.map((exec) => (
                <div
                  key={exec.id}
                  className="flex items-center gap-3 border-b border-[#2a2a32] last:border-0"
                  style={{ padding: '8px 0', fontSize: '13px' }}
                >
                  <span className="shrink-0" style={{ color: '#6e6e7a', fontSize: '12px', width: '56px' }}>
                    {new Date(exec.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{ color: '#a8a8b3' }}>
                    <strong className="font-medium" style={{ color: '#ececf0' }}>{exec.usuario?.nome || 'Sistema'}</strong>
                    {' '}{nomeAcao(exec.acao)}
                    {exec.servico?.nome && (
                      <> <strong className="font-medium" style={{ color: '#ececf0' }}>{exec.servico.nome}</strong></>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <Activity className="mb-3 h-8 w-8" style={{ color: '#3a3a44' }} />
              <p className="text-sm" style={{ color: '#a8a8b3' }}>Nenhuma atividade registrada.</p>
              <p className="mt-1 text-xs" style={{ color: '#6e6e7a' }}>
                O histórico será alimentado pelas execuções dos serviços.
              </p>
            </div>
          )}
        </div>

        {/* Resumo dos ambientes */}
        <div className="rounded-xl border border-[#2a2a32] bg-[#16161a]" style={{ padding: '16px 18px' }}>
          <div className="font-semibold text-sm mb-3" style={{ color: '#ececf0' }}>🌐 Resumo dos ambientes</div>
          {ambientes.length > 0 ? (
            ambientes.slice(0, 5).map((ambiente) => {
              const conectado = ambiente.agente?.status === 'online';
              return (
                <div
                  key={ambiente.id}
                  className="flex items-center gap-3 border-b border-[#2a2a32] last:border-0"
                  style={{ padding: '8px 0', fontSize: '13px' }}
                >
                  <span className="font-medium flex-1" style={{ color: '#ececf0' }}>
                    {ambiente.nome}
                  </span>
                  <span className="flex items-center gap-2 text-xs font-medium">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: conectado ? '#3dd68c' : '#f87171' }} />
                    <span style={{ color: conectado ? '#3dd68c' : '#f87171' }}>
                      {conectado ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <Monitor className="mb-3 h-8 w-8" style={{ color: '#3a3a44' }} />
              <p className="text-sm" style={{ color: '#a8a8b3' }}>Nenhum ambiente cadastrado.</p>
              <Link href="/ambientes/novo" className="mt-2 text-xs font-medium" style={{ color: '#5b7cfa' }}>
                Adicionar ambiente
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Projetos recentes */}
      <section>
        <div className="font-semibold text-sm mb-3" style={{ color: '#ececf0' }}>📁 Projetos recentes</div>
        <div className="rounded-xl border border-[#2a2a32] bg-[#16161a] overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left" style={{ fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#1e1e24', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#6e6e7a' }}>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Projeto</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Serviços</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Ambiente</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Status</th>
                <th className="font-medium border-b border-[#2a2a32]" style={{ padding: '14px 18px' }}>Última atividade</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={5} className="text-center" style={{ padding: '40px 18px', color: '#6e6e7a' }}>
                    <Spinner tamanho="pequeno" />
                  </td>
                </tr>
              ) : linhasTabelaProjetos.length > 0 ? (
                linhasTabelaProjetos.map((linha) => (
                  <tr
                    key={linha.id}
                    className="border-b border-[#2a2a32] transition-colors"
                    style={{ '--hover-bg': '#28282f' } as React.CSSProperties}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#28282f'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    <td style={{ padding: '14px 18px', borderBottom: '1px solid #2a2a32' }}>
                      <Link
                        href={`/projetos/${linha.id}`}
                        className="font-medium transition-colors"
                        style={{ color: '#ececf0' }}
                      >
                        {linha.nome}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#a8a8b3', borderBottom: '1px solid #2a2a32' }}>{linha.qtdServicos}</td>
                    <td style={{ padding: '14px 18px', color: '#a8a8b3', borderBottom: '1px solid #2a2a32' }}>{linha.ambiente}</td>
                    <td style={{ padding: '14px 18px', borderBottom: '1px solid #2a2a32' }}>
                      <StatusBadgeTabela variante={linha.status}>
                        {linha.statusLabel}
                      </StatusBadgeTabela>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#6e6e7a', borderBottom: '1px solid #2a2a32' }}>{linha.ultimaAtividade}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center" style={{ padding: '40px 18px', color: '#6e6e7a' }}>
                    <Server className="mx-auto mb-2 h-6 w-6" style={{ color: '#3a3a44' }} />
                    Nenhum projeto cadastrado.
                    <br />
                    <Link
                      href="/projetos/novo"
                      className="mt-2 inline-block text-xs font-medium"
                      style={{ color: '#5b7cfa' }}
                    >
                      Criar projeto
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
