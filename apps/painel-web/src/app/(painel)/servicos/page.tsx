// Página global de serviços
// Lista todos os serviços da organização com status PM2 e filtros

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { dashboardApi } from '@/lib/api';
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
} from 'lucide-react';

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
    <div className="space-y-6">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-zinc-100">
            Serviços
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Todos os serviços cadastrados nos seus projetos
          </p>
        </div>
      </header>

      {/* Erro */}
      {erro && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{erro}</p>
        </div>
      )}

      {/* Cards de contagem */}
      {servicos.length > 0 && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          {servicosFiltrados.map((servico) => (
            <Link key={servico.id} href={`/projetos/${servico.projetoId}`}>
              <Card className="group cursor-pointer transition-colors hover:border-[#5b7cfa]/40">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e1e24]">
                      <Server className="h-5 w-5 text-[#8ca2ff]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-zinc-100 group-hover:text-white">
                        {servico.nome}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-zinc-500">
                        <FolderKanban className="h-3 w-3" />
                        {servico.projetoNome || 'Projeto'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcone(servico.statusPm2)}
                    <span className={`text-xs font-medium ${statusCor(servico.statusPm2)}`}>
                      {statusLabel(servico.statusPm2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-500">
                  {servico.porta && (
                    <div className="flex items-center gap-1.5">
                      <Network className="h-3 w-3 shrink-0" />
                      <span>Porta {servico.porta}</span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
