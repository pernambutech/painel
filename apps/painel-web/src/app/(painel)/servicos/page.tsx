// Página global de serviços
// Lista todos os serviços da organização com status PM2 e filtros

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { dashboardApi, servicosApi } from '@/lib/api';
import { useSocket } from '@/lib/hooks/useSocket';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import {
  Server,
  FolderKanban,
  Network,
  CircleCheck,
  CirclePause,
  CircleX,
  HelpCircle,
  Activity,
  ExternalLink,
  Play,
  Square,
  RotateCw,
} from 'lucide-react';
import { gerarUrlServico } from '@/lib/constantes';

// ===========================================
// TIPOS
// ===========================================

interface ServicoComStatus {
  id: string;
  nome: string;
  tipo: string;
  porta: number | null;
  projetoId: string;
  ambienteId: string | null;
  statusPm2: string;
  projetoNome?: string;
}

interface DadosDashboard {
  servicos: {
    id: string;
    nome: string;
    tipo: string;
    porta: number | null;
    projetoId: string;
    ambienteId: string | null;
    statusPm2: string;
    projeto: { nome: string };
  }[];
}

// ===========================================
// FILTROS
// ===========================================

const filtros = [
  { chave: 'todos', rotulo: 'Todos', icone: Server },
  { chave: 'online', rotulo: 'Online', icone: CircleCheck },
  { chave: 'stopped', rotulo: 'Parados', icone: CirclePause },
  { chave: 'erro', rotulo: 'Com erro', icone: CircleX },
] as const;

type FiltroChave = (typeof filtros)[number]['chave'];

// ===========================================
// COMPONENTE PRINCIPAL
// ===========================================

export default function ServicosPage() {
  const { organizacao } = useAuth();
  const searchParams = useSearchParams();
  const filtroInicial = (searchParams.get('status') as FiltroChave) || 'todos';

  const [servicos, setServicos] = useState<ServicoComStatus[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroChave>(filtroInicial);
  const [controleCarregando, setControleCarregando] = useState<string | null>(null);

  // Carregar dados do dashboard (já inclui status PM2)
  const carregar = useCallback(async () => {
    if (!organizacao) return;
    try {
      setCarregando(true);
      const dados: DadosDashboard = await dashboardApi.obterDados(organizacao.id);
      const mapeados = (dados.servicos || []).map((s) => ({
        ...s,
        projetoNome: s.projeto?.nome,
      }));
      setServicos(mapeados);
    } catch {
      setErro('Erro ao carregar serviços.');
    } finally {
      setCarregando(false);
    }
  }, [organizacao]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // WebSocket: atualizar quando serviços mudarem
  useSocket({
    onStatusAgente: () => carregar(),
    onDashboardAtualizado: () => carregar(),
  });

  // Polling a cada 15 segundos
  useEffect(() => {
    if (!organizacao) return;
    const intervalo = setInterval(carregar, 15000);
    return () => clearInterval(intervalo);
  }, [organizacao, carregar]);

  // Filtrar serviços
  const servicosFiltrados = useMemo(() => {
    if (filtroAtivo === 'todos') return servicos;
    return servicos.filter((s) => s.statusPm2 === filtroAtivo);
  }, [servicos, filtroAtivo]);

  // Controle de serviço (iniciar/parar/reiniciar)
  const controlarServico = async (servico: ServicoComStatus, acao: 'iniciar' | 'parar' | 'reiniciar') => {
    if (!organizacao) return;
    try {
      setControleCarregando(`${acao}-${servico.id}`);
      const acaoApi = acao === 'iniciar' ? servicosApi.iniciar : acao === 'parar' ? servicosApi.parar : servicosApi.reiniciar;
      await acaoApi(organizacao.id, servico.projetoId, servico.id);
      // Recarregar status
      await carregar();
    } catch {
      setErro(`Erro ao ${acao} serviço.`);
    } finally {
      setControleCarregando(null);
    }
  };

  // Contadores
  const contadores = useMemo(() => ({
    total: servicos.length,
    online: servicos.filter((s) => s.statusPm2 === 'online').length,
    stopped: servicos.filter((s) => s.statusPm2 === 'stopped').length,
    erro: servicos.filter((s) => s.statusPm2 === 'errored').length,
  }), [servicos]);

  // Ícone de status
  const statusIcone = (status: string) => {
    switch (status) {
      case 'online':
        return <CircleCheck className="h-3.5 w-3.5 text-emerald-400" />;
      case 'stopped':
        return <CirclePause className="h-3.5 w-3.5 text-amber-400" />;
      case 'errored':
        return <CircleX className="h-3.5 w-3.5 text-red-400" />;
      default:
        return <HelpCircle className="h-3.5 w-3.5 text-zinc-500" />;
    }
  };

  // Cor do status
  const statusCor = (status: string) => {
    switch (status) {
      case 'online': return 'text-emerald-400';
      case 'stopped': return 'text-amber-400';
      case 'errored': return 'text-red-400';
      default: return 'text-zinc-500';
    }
  };

  // Label do status
  const statusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'stopped': return 'Parado';
      case 'errored': return 'Erro';
      default: return 'Desconhecido';
    }
  };

  // ===========================================
  // ESTADO DE CARREGAMENTO
  // ===========================================

  if (carregando && servicos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Spinner tamanho="grande" />
          <p className="text-sm text-zinc-500">Carregando serviços...</p>
        </div>
      </div>
    );
  }

  // ===========================================
  // RENDERIZAÇÃO
  // ===========================================

  return (
    <div>
      {/* Cabeçalho */}
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.4px' }} className="text-zinc-100">
          Serviços
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#a8a8b3' }}>
          Visão geral de todos os serviços.
        </p>
      </header>

      {/* Erro */}
      {erro && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4" style={{ marginBottom: '16px' }}>
          <p className="text-sm text-red-400">{erro}</p>
        </div>
      )}

      {/* Cards de contagem */}
      {servicos.length > 0 && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" style={{ marginBottom: '24px' }}>
          {filtros.map(({ chave, rotulo, icone: Icone }) => {
            const valor =
              chave === 'todos' ? contadores.total :
              chave === 'online' ? contadores.online :
              chave === 'stopped' ? contadores.stopped :
              contadores.erro;
            const ativo = filtroAtivo === chave;

            return (
              <button
                key={chave}
                type="button"
                onClick={() => setFiltroAtivo(chave)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  ativo
                    ? 'border-[#5b7cfa]/50 bg-[#5b7cfa]/10'
                    : 'border-[#2a2a32] bg-[#1e1e24] hover:border-zinc-600'
                }`}
              >
                <Icone className={`h-4 w-4 shrink-0 ${ativo ? 'text-[#8ca2ff]' : 'text-zinc-500'}`} />
                <div>
                  <p className={`text-[20px] font-semibold tracking-[-0.02em] ${ativo ? 'text-zinc-100' : 'text-zinc-300'}`}>
                    {valor}
                  </p>
                  <p className="text-[11px] text-zinc-500">{rotulo}</p>
                </div>
              </button>
            );
          })}
        </section>
      )}

      {/* Lista de serviços */}
      {servicos.length === 0 && !erro ? (
        <Card>
          <div className="py-12 text-center">
            <Server className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
            <h3 className="mb-2 text-lg font-medium text-zinc-300">Nenhum serviço cadastrado</h3>
            <p className="mx-auto max-w-md text-sm text-zinc-500">
              Acesse um projeto e adicione serviços para começar a gerenciar suas aplicações.
            </p>
            <Link
              href="/projetos"
              className="mt-4 inline-flex rounded-lg bg-[#5b7cfa] px-4 py-2 text-sm font-medium text-white hover:bg-[#6f8cff]"
            >
              Ver projetos
            </Link>
          </div>
        </Card>
      ) : servicosFiltrados.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <Activity className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-400">
              Nenhum serviço com status <span className="font-medium">{statusLabel(filtroAtivo)}</span>.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {servicosFiltrados.map((servico) => {
            const emControle = controleCarregando?.includes(servico.id);
            return (
              <Card key={servico.id} className="group transition-colors">
                <div className="mb-3 flex items-start justify-between">
                  <Link href={`/projetos/${servico.projetoId}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e1e24]">
                      <Server className="h-5 w-5 text-[#8ca2ff]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-zinc-100 group-hover:text-white truncate">
                        {servico.nome}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-zinc-500 truncate">
                        <FolderKanban className="h-3 w-3 shrink-0" />
                        {servico.projetoNome || 'Projeto'}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    {statusIcone(servico.statusPm2)}
                    <span className={`text-xs font-medium ${statusCor(servico.statusPm2)}`}>
                      {statusLabel(servico.statusPm2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-500 mb-3">
                  {servico.porta && (
                    <div className="flex items-center gap-1.5">
                      <Network className="h-3 w-3 shrink-0" />
                      <span>Porta {servico.porta}</span>
                      {servico.statusPm2 === 'online' && (
                        <a
                          href={gerarUrlServico(servico.porta) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-[#8ca2ff] hover:text-[#a8b8ff] transition-colors inline-flex items-center gap-0.5"
                          title="Abrir serviço"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Botões de controle */}
                <div className="flex items-center gap-1.5 border-t border-[#2a2a32] pt-3">
                  {servico.statusPm2 !== 'online' && (
                    <button
                      onClick={(e) => { e.preventDefault(); controlarServico(servico, 'iniciar'); }}
                      disabled={emControle}
                      className="flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                      title="Iniciar"
                    >
                      <Play className="h-3 w-3" />
                      Iniciar
                    </button>
                  )}
                  {servico.statusPm2 === 'online' && (
                    <button
                      onClick={(e) => { e.preventDefault(); controlarServico(servico, 'parar'); }}
                      disabled={emControle}
                      className="flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                      title="Parar"
                    >
                      <Square className="h-3 w-3" />
                      Parar
                    </button>
                  )}
                  {servico.statusPm2 === 'online' && (
                    <button
                      onClick={(e) => { e.preventDefault(); controlarServico(servico, 'reiniciar'); }}
                      disabled={emControle}
                      className="flex items-center gap-1 rounded-md bg-[#5b7cfa]/10 border border-[#5b7cfa]/20 px-2.5 py-1.5 text-xs font-medium text-[#8ca2ff] hover:bg-[#5b7cfa]/20 transition-colors disabled:opacity-50"
                      title="Reiniciar"
                    >
                      <RotateCw className="h-3 w-3" />
                      Reiniciar
                    </button>
                  )}
                  {emControle && (
                    <Spinner tamanho="pequeno" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
