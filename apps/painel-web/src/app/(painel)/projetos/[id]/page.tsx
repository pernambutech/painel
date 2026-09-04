// Página de detalhes de um projeto
// Exibe informações, permite editar e arquivar/reativar

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { projetosApi, servicosApi, servicosPm2Api, agentesApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { BadgeSimples } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import {
  Activity,
  ArrowLeft,
  Archive,
  ArchiveRestore,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  FileText,
  FolderKanban,
  GitBranch,
  GitCommit,
  GitPullRequest,
  HardDrive,
  Network,
  Play,
  Plus,
  RotateCw,
  Server,
  Square,
  Terminal,
  Trash2,
  X,
} from 'lucide-react';
import { CommitsModal } from '@/components/CommitsModal';
import { EditarServicoModal } from '@/components/EditarServicoModal';
import type { Projeto, Servico, StatusPm2, GitStatus, GitBranchResponse, GitLogEntry, GitArquivo, Log } from '@/types';

/**
 * Formata milissegundos em tempo legível.
 * <1min → "45s" | <1h → "3m 45s" | <1d → "2h 15m 30s" | ≥1d → "1d 5h 15m"
 */
function formatarUptime(ms: number): string {
  const totalSeg = Math.floor(ms / 1000);
  const seg = totalSeg % 60;
  const totalMin = Math.floor(totalSeg / 60);
  const min = totalMin % 60;
  const totalHoras = Math.floor(totalMin / 60);
  const horas = totalHoras % 24;
  const dias = Math.floor(totalHoras / 24);

  const partes: string[] = [];
  if (dias > 0) partes.push(`${dias}d`);
  if (horas > 0 || dias > 0) partes.push(`${horas}h`);
  if (min > 0 || horas > 0 || dias > 0) partes.push(`${min}m`);
  if (partes.length === 0 || (dias === 0 && horas === 0 && min === 0)) partes.push(`${seg}s`);
  else if (dias > 0) {
    // Para dias, incluir segundos apenas se relevante
    if (seg > 0) partes.push(`${seg}s`);
  } else {
    // Para horas/minutos, sempre incluir segundos
    partes.push(`${seg}s`);
  }

  return partes.join(' ');
}

export default function ProjetoDetalhePage() {
  const params = useParams();
  const { organizacao } = useAuth();

  const projetoId = params.id as string;

  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroProjeto, setErroProjeto] = useState('');
  const [erroServico, setErroServico] = useState('');
  const [editando, setEditando] = useState(false);
  const [nomeEditado, setNomeEditado] = useState('');
  const [descricaoEditada, setDescricaoEditada] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [confirmandoArquivamento, setConfirmandoArquivamento] = useState(false);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregandoServicos, setCarregandoServicos] = useState(true);
  const [servicoParaRemover, setServicoParaRemover] = useState<Servico | null>(null);
  const [statusPorServico, setStatusPorServico] = useState<Record<string, StatusPm2>>({});
  const [controleCarregando, setControleCarregando] = useState<string | null>(null);
  const [servicoExpandidoId, setServicoExpandidoId] = useState<string | null>(null);
  const [logsModalServico, setLogsModalServico] = useState<Servico | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [carregandoLogs, setCarregandoLogs] = useState(false);
  const [tipoLog, setTipoLog] = useState<'todos' | 'stdout' | 'stderr'>('todos');
  const [erroLogs, setErroLogs] = useState('');

  // Estado do modal Git
  const [gitModalServico, setGitModalServico] = useState<Servico | null>(null);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [gitBranches, setGitBranches] = useState<GitBranchResponse | null>(null);
  const [gitSaida, setGitSaida] = useState('');
  const [carregandoGit, setCarregandoGit] = useState(false);
  const [erroGit, setErroGit] = useState('');
  const [gitAba, setGitAba] = useState<'status' | 'branch'>('status');

  // Estado do modal de Commits
  const [commitsModalServico, setCommitsModalServico] = useState<Servico | null>(null);
  const [commitsPorServico, setCommitsPorServico] = useState<Record<string, GitLogEntry[]>>({});

  // Estado do modal de edição de serviço
  const [servicoEditando, setServicoEditando] = useState<Servico | null>(null);

  useEffect(() => {
    if (organizacao && projetoId) {
      carregarProjeto();
      carregarServicos();
    }
  }, [organizacao, projetoId]);

  const carregarServicos = async () => {
    if (!organizacao) return;
    try {
      setCarregandoServicos(true);
      const dados = await servicosApi.listarPorProjeto(organizacao.id, projetoId);
      setServicos(dados || []);
      // Buscar status de cada serviço em paralelo (não bloqueante)
      dados?.forEach((s: Servico) => {
        servicosApi
          .obterStatus(organizacao.id, projetoId, s.id)
          .then((status) => {
            setStatusPorServico((prev) => ({ ...prev, [s.id]: status }));
          })
          .catch(() => {
            setStatusPorServico((prev) => ({ ...prev, [s.id]: { status: 'desconhecido', pid: null, uptime: null, restarts: null, cpu: null, memoria: null } }));
          });
        // Buscar últimos 2 commits se o serviço tem diretório Git
        if (s.diretorio) {
          servicosApi
            .gitLog(organizacao.id, projetoId, s.id, 2)
            .then((dados) => {
              setCommitsPorServico((prev) => ({ ...prev, [s.id]: dados.commits || [] }));
            })
            .catch(() => {
              setCommitsPorServico((prev) => ({ ...prev, [s.id]: [] }));
            });
        }
      });
    } catch {
      // Silencioso — lista vazia
    } finally {
      setCarregandoServicos(false);
    }
  };

  const controlarServico = async (servicoId: string, acao: 'iniciar' | 'parar' | 'reiniciar') => {
    if (!organizacao) return;
    const acaoApi =
      acao === 'iniciar'
        ? servicosApi.iniciar
        : acao === 'parar'
          ? servicosApi.parar
          : servicosApi.reiniciar;
    try {
      setControleCarregando(`${acao}-${servicoId}`);
      await acaoApi(organizacao.id, projetoId, servicoId);
      // Atualizar status após ação
      const status = await servicosApi.obterStatus(organizacao.id, projetoId, servicoId);
      setStatusPorServico((prev) => ({ ...prev, [servicoId]: status }));
    } catch (err: any) {
      setErroServico(err.response?.data?.message || `Erro ao ${acao} serviço.`);
    } finally {
      setControleCarregando(null);
    }
  };

  // Operações em lote: iniciar/parar/reiniciar todos os serviços do projeto
  const controlarTodosServicos = async (acao: 'iniciar' | 'parar' | 'reiniciar') => {
    if (!organizacao || servicos.length === 0) return;
    const acaoLabel = acao === 'iniciar' ? 'Iniciar' : acao === 'parar' ? 'Parar' : 'Reiniciar';
    try {
      setControleCarregando(`lote-${acao}`);
      // Executa todas as ações em paralelo
      const resultados = await Promise.allSettled(
        servicos.map(async (s) => {
          const acaoApi =
            acao === 'iniciar'
              ? servicosApi.iniciar
              : acao === 'parar'
                ? servicosApi.parar
                : servicosApi.reiniciar;
          await acaoApi(organizacao.id, projetoId, s.id);
          return s.id;
        }),
      );
      // Atualiza status de cada serviço
      const servicosIds = servicos.map((s) => s.id);
      for (const servicoId of servicosIds) {
        servicosApi
          .obterStatus(organizacao.id, projetoId, servicoId)
          .then((status) => {
            setStatusPorServico((prev) => ({ ...prev, [servicoId]: status }));
          })
          .catch(() => {});
      }
      const sucessos = resultados.filter((r) => r.status === 'fulfilled').length;
      const falhas = resultados.filter((r) => r.status === 'rejected').length;
      if (falhas > 0) {
        setErroServico(`${acaoLabel}: ${sucessos} sucesso(s), ${falhas} falha(s).`);
      } else {
        setErroServico('');
      }
    } catch (err: any) {
      setErroServico(err?.response?.data?.message || `Erro ao ${acao} todos os serviços.`);
    } finally {
      setControleCarregando(null);
    }
  };

  const salvarPm2DoServico = async (servico: Servico) => {
    if (!organizacao || !servico.ambiente?.id) return;

    try {
      setControleCarregando(`pm2-save-${servico.id}`);
      // Busca o agente associado ao ambiente do serviço
      const agente = await agentesApi.obterPorAmbiente(organizacao.id, servico.ambiente.id);
      if (!agente?.id) {
        setErroServico(`Nenhum agente encontrado para o ambiente "${servico.ambiente.nome}".`);
        return;
      }
      await servicosPm2Api.salvar(organizacao.id, agente.id);
      setErroServico('');
    } catch (err: any) {
      setErroServico(
        err?.response?.data?.message ||
          err?.message ||
          `Erro ao persistir o PM2 do serviço ${servico.nome}.`,
      );
    } finally {
      setControleCarregando(null);
    }
  };

  const abrirLogs = async (servico: Servico) => {
    setLogsModalServico(servico);
    setLogs([]);
    setTipoLog('todos');
    await carregarLogs(servico, 'todos');
  };

  const carregarLogs = async (servico: Servico, tipo: string) => {
    if (!organizacao) return;
    try {
      setCarregandoLogs(true);
      setErroLogs('');
      const dados = await servicosApi.obterLogs(organizacao.id, projetoId, servico.id, {
        linhas: 100,
        tipo,
      });
      setLogs(dados.logs || []);
    } catch (err: any) {
      console.error('[LOGS] Erro ao carregar logs:', err);
      setLogs([]);
      setErroLogs(err?.response?.data?.message || err?.message || 'Erro ao carregar logs.');
    } finally {
      setCarregandoLogs(false);
    }
  };

  // ===========================================
  // OPERAÇÕES GIT
  // ===========================================

  const abrirGit = async (servico: Servico) => {
    setGitModalServico(servico);
    setGitStatus(null);
    setGitBranches(null);
    setGitSaida('');
    setErroGit('');
    setGitAba('status');
    await carregarGitStatus(servico);
  };

  const carregarGitStatus = async (servico: Servico) => {
    if (!organizacao) return;
    try {
      setCarregandoGit(true);
      setErroGit('');
      const dados = await servicosApi.gitStatus(organizacao.id, projetoId, servico.id);
      setGitStatus(dados);
    } catch (err: any) {
      console.error('[GIT] Erro ao obter status:', err);
      setGitStatus(null);
      setErroGit(err?.response?.data?.message || err?.message || 'Erro ao obter status Git.');
    } finally {
      setCarregandoGit(false);
    }
  };

  const carregarGitBranches = async (servico: Servico) => {
    if (!organizacao) return;
    try {
      setCarregandoGit(true);
      setErroGit('');
      const dados = await servicosApi.gitBranch(organizacao.id, projetoId, servico.id);
      setGitBranches(dados);
    } catch (err: any) {
      console.error('[GIT] Erro ao listar branches:', err);
      setGitBranches(null);
      setErroGit(err?.response?.data?.message || err?.message || 'Erro ao listar branches.');
    } finally {
      setCarregandoGit(false);
    }
  };

  const executarGitPull = async (servico: Servico) => {
    if (!organizacao) return;
    try {
      setCarregandoGit(true);
      setErroGit('');
      setGitSaida('Executando git pull...');
      const dados = await servicosApi.gitPull(organizacao.id, projetoId, servico.id);
      setGitSaida(dados.saida || 'Pull concluído.');
      await carregarGitStatus(servico);
    } catch (err: any) {
      console.error('[GIT] Erro ao executar pull:', err);
      setGitSaida('');
      setErroGit(err?.response?.data?.message || err?.message || 'Erro ao executar git pull.');
    } finally {
      setCarregandoGit(false);
    }
  };

  const carregarProjeto = async () => {
    if (!organizacao) return;

    try {
      setCarregando(true);
      const dados = await projetosApi.obterPorId(organizacao.id, projetoId);
      setProjeto(dados);
      setNomeEditado(dados.nome);
      setDescricaoEditada(dados.descricao || '');
    } catch (err) {
      setErroProjeto('Erro ao carregar projeto.');
    } finally {
      setCarregando(false);
    }
  };

  const salvarEdicao = async () => {
    if (!organizacao || !projeto) return;

    try {
      setSalvando(true);
      await projetosApi.atualizar(organizacao.id, projeto.id, {
        nome: nomeEditado,
        descricao: descricaoEditada,
      });
      setProjeto({
        ...projeto,
        nome: nomeEditado,
        descricao: descricaoEditada,
      });
      setEditando(false);
    } catch (err) {
      setErroProjeto('Erro ao salvar alterações.');
    } finally {
      setSalvando(false);
    }
  };

  const arquivarProjeto = async () => {
    if (!organizacao || !projeto) return;

    try {
      setSalvando(true);
      const dados = await projetosApi.arquivar(organizacao.id, projeto.id);
      setProjeto(dados);
      setConfirmandoArquivamento(false);
    } catch (err) {
      setErroProjeto('Erro ao arquivar projeto.');
    } finally {
      setSalvando(false);
    }
  };

  const reativarProjeto = async () => {
    if (!organizacao || !projeto) return;

    try {
      setSalvando(true);
      const dados = await projetosApi.reativar(organizacao.id, projeto.id);
      setProjeto(dados);
    } catch (err) {
      setErroProjeto('Erro ao reativar projeto.');
    } finally {
      setSalvando(false);
    }
  };

  const removerServico = async () => {
    if (!organizacao || !servicoParaRemover) return;
    try {
      setSalvando(true);
      await servicosApi.remover(organizacao.id, projetoId, servicoParaRemover.id);
      setServicos((prev) => prev.filter((s) => s.id !== servicoParaRemover.id));
      setServicoParaRemover(null);
    } catch {
      setErroServico('Erro ao remover serviço.');
    } finally {
      setSalvando(false);
    }
  };

  const tipoLabels: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    api: 'API',
    worker: 'Worker',
    bot: 'Bot',
    custom: 'Personalizado',
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Spinner tamanho="grande" />
          <p className="text-sm text-zinc-500">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Projeto não encontrado.</p>
        <Link
          href="/projetos"
          className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block"
        >
          Voltar para projetos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div>
        <Link
          href="/projetos"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5b7cfa]/15">
              <FolderKanban className="w-6 h-6 text-[#8ca2ff]" />
            </div>
            <div>
              {editando ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={nomeEditado}
                    onChange={(e) => setNomeEditado(e.target.value)}
                    className="text-lg font-bold"
                  />
                  <Button
                    variante="fantasma"
                    tamanho="pequeno"
                    onClick={salvarEdicao}
                    carregando={salvando}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variante="fantasma"
                    tamanho="pequeno"
                    onClick={() => {
                      setEditando(false);
                      setNomeEditado(projeto.nome);
                      setDescricaoEditada(projeto.descricao || '');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-zinc-100">{projeto.nome}</h1>
                  <Button variante="fantasma" tamanho="pequeno" onClick={() => setEditando(true)}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-zinc-500 mt-1">Projeto</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {projeto.ativo ? (
              <BadgeSimples variante="online">Ativo</BadgeSimples>
            ) : (
              <BadgeSimples variante="neutro">Arquivado</BadgeSimples>
            )}
            {projeto.ativo ? (
              <Button
                variante="secundario"
                tamanho="pequeno"
                onClick={() => setConfirmandoArquivamento(true)}
              >
                <Archive className="w-4 h-4" />
                Arquivar
              </Button>
            ) : (
              <Button
                variante="secundario"
                tamanho="pequeno"
                onClick={reativarProjeto}
                carregando={salvando}
              >
                <ArchiveRestore className="w-4 h-4" />
                Reativar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Erro do projeto */}
      {erroProjeto && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{erroProjeto}</p>
          <Button variante="fantasma" tamanho="pequeno" onClick={() => { setErroProjeto(''); carregarProjeto(); }}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Descrição */}
      <Card>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Descrição</h2>
        {editando ? (
          <div className="space-y-3">
            <textarea
              value={descricaoEditada}
              onChange={(e) => setDescricaoEditada(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-[#2a2a32] bg-[#17171c] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-[#5b7cfa]"
            />
            <div className="flex justify-end gap-3">
              <Button variante="fantasma" tamanho="pequeno" onClick={() => setEditando(false)}>
                Cancelar
              </Button>
              <Button tamanho="pequeno" onClick={salvarEdicao} carregando={salvando}>
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">
            {projeto.descricao || 'Sem descrição. Clique em editar para adicionar.'}
          </p>
        )}
      </Card>

      {/* Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800">
              <CalendarDays className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Criado em</p>
              <p className="text-sm font-medium text-zinc-200">
                {new Date(projeto.criadoEm).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800">
              <Server className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Serviços</p>
              <p className="text-sm font-medium text-zinc-200">
                {carregandoServicos ? 'Carregando...' : `${servicos.length} serviço(s)`}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Seção de serviços */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Serviços do projeto</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Botões de operação em lote */}
            {servicos.length > 0 && (
              <div className="flex items-center gap-1.5 mr-2">
                <Button
                  variante="fantasma"
                  tamanho="pequeno"
                  onClick={() => controlarTodosServicos('iniciar')}
                  carregando={controleCarregando === 'lote-iniciar'}
                  title="Iniciar todos os serviços"
                >
                  <Play className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variante="fantasma"
                  tamanho="pequeno"
                  onClick={() => controlarTodosServicos('parar')}
                  carregando={controleCarregando === 'lote-parar'}
                  title="Parar todos os serviços"
                >
                  <Square className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variante="fantasma"
                  tamanho="pequeno"
                  onClick={() => controlarTodosServicos('reiniciar')}
                  carregando={controleCarregando === 'lote-reiniciar'}
                  title="Reiniciar todos os serviços"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
            <Link href={`/projetos/${projetoId}/servicos/novo`}>
              <Button tamanho="pequeno">
                <Plus className="w-4 h-4" />
                Adicionar serviço
              </Button>
            </Link>
          </div>
        </div>

        {erroServico && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-between">
            <p className="text-sm text-red-400">{erroServico}</p>
            <button onClick={() => setErroServico('')} className="text-red-400 hover:text-red-300 text-xs">✕</button>
          </div>
        )}

        {carregandoServicos ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : servicos.length === 0 ? (
          <div className="text-center py-8">
            <Server className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">Nenhum serviço configurado neste projeto.</p>
            <p className="text-xs text-zinc-600 mt-1">
              Adicione frontend, backend, workers e outros serviços.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {servicos.map((servico) => {
              const status = statusPorServico[servico.id];
              const estado = status?.status || 'desconhecido';
              const varianteStatus =
                estado === 'online'
                  ? 'online'
                  : estado === 'stopped'
                    ? 'offline'
                    : estado === 'errored'
                      ? 'erro'
                      : 'neutro';
              const carregandoAcao = controleCarregando?.endsWith(servico.id);
              const expandido = servicoExpandidoId === servico.id;
              return (
                <div
                  key={servico.id}
                  className="rounded-lg border border-[#2a2a32] bg-[#17171c]"
                >
                  {/* Linha principal — clicável para expandir */}
                  <div
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-[#1c1c22] transition-colors"
                    onClick={() => setServicoExpandidoId(expandido ? null : servico.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-zinc-100">{servico.nome}</h3>
                        <BadgeSimples variante="neutro">
                          {tipoLabels[servico.tipo] || servico.tipo}
                        </BadgeSimples>
                        <BadgeSimples variante={varianteStatus as any}>{estado}</BadgeSimples>
                        {status?.pid && (
                          <span className="text-xs text-zinc-500">PID {status.pid}</span>
                        )}
{status?.restarts != null && status.restarts > 0 && (
                           <span className="text-xs text-amber-400">{status.restarts} reinícios</span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-zinc-500">
                        {servico.diretorio && (
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" /> {servico.diretorio}
                          </span>
                        )}
                        {servico.comando && (
                          <span className="flex items-center gap-1">
                            <Terminal className="w-3 h-3" /> {servico.comando}
                          </span>
                        )}
                        {servico.porta && (
                          <span className="flex items-center gap-1">
                            <Network className="w-3 h-3" /> :{servico.porta}
                          </span>
                        )}
                        {servico.ambiente && <span>Ambiente: {servico.ambiente.nome}</span>}
{status?.uptime != null && (
                           <span className="flex items-center gap-1">
                             <Activity className="w-3 h-3" /> {formatarUptime(status.uptime)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variante="fantasma"
                        tamanho="pequeno"
                        title="Iniciar"
                        onClick={(e) => { e.stopPropagation(); controlarServico(servico.id, 'iniciar'); }}
                        carregando={controleCarregando === `iniciar-${servico.id}`}
                        disabled={!!carregandoAcao}
                      >
                        <Play className="w-4 h-4 text-emerald-400" />
                      </Button>
                      <Button
                        variante="fantasma"
                        tamanho="pequeno"
                        title="Parar"
                        onClick={(e) => { e.stopPropagation(); controlarServico(servico.id, 'parar'); }}
                        carregando={controleCarregando === `parar-${servico.id}`}
                        disabled={!!carregandoAcao}
                      >
                        <Square className="w-4 h-4 text-amber-400" />
                      </Button>
                      <Button
                        variante="fantasma"
                        tamanho="pequeno"
                        title="Reiniciar"
                        onClick={(e) => { e.stopPropagation(); controlarServico(servico.id, 'reiniciar'); }}
                        carregando={controleCarregando === `reiniciar-${servico.id}`}
                        disabled={!!carregandoAcao}
                      >
                        <RotateCw className="w-4 h-4 text-blue-400" />
                      </Button>
                      <div className="ml-1 h-6 w-px bg-[#2a2a32]" />
                      {expandido ? (
                        <ChevronUp className="h-4 w-4 text-zinc-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-zinc-500" />
                      )}
                    </div>
                  </div>

                  {/* Painel expandido — detalhes do serviço */}
                  {expandido && (
                    <div className="border-t border-[#2a2a32] px-4 py-3 bg-[#13131a]">
                      <div className="grid gap-3 text-xs sm:grid-cols-2">
                        {/* Coluna 1: Configuração */}
                        <div className="space-y-2">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Configuração</p>
                          <div className="space-y-1 text-zinc-400">
                            <div><span className="text-zinc-600">ID:</span> <span className="font-mono text-zinc-500">{servico.id.slice(0, 8)}...</span></div>
                            {servico.diretorio && <div><span className="text-zinc-600">Diretório:</span> {servico.diretorio}</div>}
                            {servico.comando && <div><span className="text-zinc-600">Comando:</span> {servico.comando}</div>}
                            {servico.porta && <div><span className="text-zinc-600">Porta:</span> {servico.porta}</div>}
                            {servico.ambiente && <div><span className="text-zinc-600">Ambiente:</span> {servico.ambiente.nome}</div>}
                          </div>
                        </div>
                        {/* Coluna 2: Status e ações */}
                        <div className="space-y-2">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Status</p>
                          <div className="space-y-1 text-zinc-400">
                            <div><span className="text-zinc-600">Estado:</span> {estado}</div>
                            {status?.pid && <div><span className="text-zinc-600">PID:</span> {status.pid}</div>}
                            {status?.uptime != null && (
                              <div><span className="text-zinc-600">Uptime:</span> {formatarUptime(status.uptime)}</div>
                            )}
                            {status?.restarts != null && (
                              <div><span className="text-zinc-600">Reinícios:</span> {status.restarts}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 pt-1">
                            <Button
                              variante="fantasma"
                              tamanho="pequeno"
                              title="Ver logs"
                              onClick={(e) => { e.stopPropagation(); abrirLogs(servico); }}
                            >
                              <FileText className="w-4 h-4 text-zinc-400" /> <span className="text-xs">Logs</span>
                            </Button>
                            <Button
                              variante="fantasma"
                              tamanho="pequeno"
                              title="Git"
                              onClick={(e) => { e.stopPropagation(); abrirGit(servico); }}
                            >
                              <GitBranch className="w-4 h-4 text-orange-400" /> <span className="text-xs">Git</span>
                            </Button>
                            {servico.diretorio && (
                              <Button
                                variante="fantasma"
                                tamanho="pequeno"
                                title="Commits"
                                onClick={(e) => { e.stopPropagation(); setCommitsModalServico(servico); }}
                              >
                                <GitCommit className="w-4 h-4 text-cyan-400" /> <span className="text-xs">Commits</span>
                              </Button>
                            )}
                            <Button
                              variante="fantasma"
                              tamanho="pequeno"
                              title="Salvar PM2"
                              onClick={(e) => { e.stopPropagation(); salvarPm2DoServico(servico); }}
                              carregando={controleCarregando === `pm2-save-${servico.id}`}
                            >
                              <Terminal className="w-4 h-4 text-violet-400" /> <span className="text-xs">PM2</span>
                            </Button>
                            <div className="ml-1 h-6 w-px bg-[#2a2a32]" />
                            <Button
                              variante="fantasma"
                              tamanho="pequeno"
                              title="Editar serviço"
                              onClick={(e) => { e.stopPropagation(); setServicoEditando(servico); }}
                            >
                              <Edit3 className="w-4 h-4 text-zinc-400" />
                            </Button>
                            <Button
                              variante="fantasma"
                              tamanho="pequeno"
                              onClick={(e) => { e.stopPropagation(); setServicoParaRemover(servico); }}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          </div>
                          {/* Últimos 2 commits */}
                          {commitsPorServico[servico.id]?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Últimos commits</p>
                              {commitsPorServico[servico.id].slice(0, 2).map((c: GitLogEntry) => (
                                <div key={c.hash} className="flex items-center gap-2 text-[11px]">
                                  <span className="font-mono text-[#8ca2ff] bg-[#5b7cfa]/10 px-1 py-0.5 rounded">{c.hash.slice(0, 7)}</span>
                                  <span className="text-zinc-500 truncate">{c.mensagem}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal de confirmação de arquivamento */}
      <Modal
        aberto={confirmandoArquivamento}
        aoFechar={() => setConfirmandoArquivamento(false)}
        titulo="Arquivar projeto"
      >
        <h3 className="text-lg font-semibold text-zinc-100 mb-2">Arquivar projeto?</h3>
        <p className="text-sm text-zinc-500 mb-6">
          O projeto ficará oculto da lista principal, mas poderá ser reativado a qualquer
          momento.
        </p>
        <div className="flex gap-3">
          <Button
            variante="secundario"
            larguraTotal
            onClick={() => setConfirmandoArquivamento(false)}
          >
            Cancelar
          </Button>
          <Button
            variante="perigo"
            larguraTotal
            onClick={arquivarProjeto}
            carregando={salvando}
          >
            Arquivar
          </Button>
        </div>
      </Modal>

      {/* Modal de confirmação de remoção de serviço */}
      <Modal
        aberto={!!servicoParaRemover}
        aoFechar={() => setServicoParaRemover(null)}
        titulo="Remover serviço"
      >
        <h3 className="text-lg font-semibold text-zinc-100 mb-2">Remover serviço?</h3>
        <p className="text-sm text-zinc-500 mb-6">
          O serviço <strong className="text-zinc-300">{servicoParaRemover?.nome}</strong> será
          removido. Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <Button
            variante="secundario"
            larguraTotal
            onClick={() => setServicoParaRemover(null)}
          >
            Cancelar
          </Button>
          <Button variante="perigo" larguraTotal onClick={removerServico} carregando={salvando}>
            Remover
          </Button>
        </div>
      </Modal>

      {/* Modal de logs */}
      <Modal
        aberto={!!logsModalServico}
        aoFechar={() => setLogsModalServico(null)}
        titulo={`Logs — ${logsModalServico?.nome || ''}`}
        larguraMaxima="max-w-3xl"
        naoFecharBackdrop
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-100">
            Logs — {logsModalServico?.nome}
          </h3>
          <Button
            variante="fantasma"
            tamanho="pequeno"
            onClick={() => setLogsModalServico(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="mb-3 flex items-center gap-2">
          {(['todos', 'stdout', 'stderr'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTipoLog(t);
                if (logsModalServico) carregarLogs(logsModalServico, t);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-medium ${tipoLog === t ? 'bg-[#5b7cfa] text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {t}
            </button>
          ))}
          <Button
            variante="fantasma"
            tamanho="pequeno"
            onClick={() => { if (logsModalServico) carregarLogs(logsModalServico, tipoLog); }}
            carregando={carregandoLogs}
          >
            Atualizar
          </Button>
        </div>
        {erroLogs && (
          <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {erroLogs}
          </div>
        )}
        <div className="flex-1 overflow-auto rounded-lg border border-[#2a2a32] bg-[#0d0d0f] p-4 max-h-[50vh]">
          {carregandoLogs ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum log encontrado.</p>
          ) : (
            <div className="space-y-1 text-xs font-mono">
              {logs.map((l: Log, i: number) => (
                <div key={i} className={l.nivel === 'error' ? 'text-red-300' : 'text-zinc-300'}>
                  <span className="text-zinc-500">
                    {new Date(l.timestamp).toLocaleTimeString('pt-BR')}{' '}
                  </span>
                  <span className={l.fonte === 'stderr' ? 'text-red-400' : ''}>
                    {l.mensagem}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Git */}
      <Modal
        aberto={!!gitModalServico}
        aoFechar={() => setGitModalServico(null)}
        titulo={`Git — ${gitModalServico?.nome || ''}`}
        larguraMaxima="max-w-3xl"
        naoFecharBackdrop
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-100">
            Git — {gitModalServico?.nome}
          </h3>
          <Button variante="fantasma" tamanho="pequeno" onClick={() => setGitModalServico(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Abas */}
        <div className="mb-3 flex items-center gap-2">
          {(['status', 'branch'] as const).map((aba) => (
            <button
              key={aba}
              onClick={() => {
                setGitAba(aba);
                if (aba === 'status' && !gitStatus && gitModalServico) carregarGitStatus(gitModalServico);
                if (aba === 'branch' && !gitBranches && gitModalServico) carregarGitBranches(gitModalServico);
              }}
              className={`rounded-lg px-3 py-1 text-xs font-medium ${gitAba === aba ? 'bg-[#5b7cfa] text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {aba === 'status' ? 'Status' : 'Branches'}
            </button>
          ))}
          <div className="flex-1" />
          <Button
            variante="secundario"
            tamanho="pequeno"
            onClick={() => { if (gitModalServico) executarGitPull(gitModalServico); }}
            carregando={carregandoGit}
          >
            <GitPullRequest className="w-4 h-4" />
            Pull
          </Button>
          <Button
            variante="fantasma"
            tamanho="pequeno"
            onClick={() => {
              if (gitAba === 'status' && gitModalServico) carregarGitStatus(gitModalServico);
              else if (gitModalServico) carregarGitBranches(gitModalServico);
            }}
            carregando={carregandoGit}
          >
            Atualizar
          </Button>
        </div>

        {/* Erro */}
        {erroGit && (
          <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {erroGit}
          </div>
        )}

        {/* Saída do pull */}
        {gitSaida && (
          <div className="mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 font-mono whitespace-pre-wrap">
            {gitSaida}
          </div>
        )}

        {/* Conteúdo */}
        <div className="flex-1 overflow-auto rounded-lg border border-[#2a2a32] bg-[#0d0d0f] p-4 max-h-[50vh]">
          {carregandoGit ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : gitAba === 'status' ? (
            !gitStatus ? (
              <p className="text-sm text-zinc-500">Sem dados de status.</p>
            ) : (
              <div className="space-y-2 text-xs font-mono">
                <div className="text-zinc-300">
                  <span className="text-zinc-500">Branch: </span>
                  <span className="text-[#8ca2ff] font-semibold">{gitStatus.branch}</span>
                </div>
                {gitStatus.branchInfo && (
                  <div className="text-zinc-500">{gitStatus.branchInfo}</div>
                )}
                {gitStatus.arquivos?.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    {gitStatus.arquivos.map((a: GitArquivo, i: number) => (
                      <div key={i} className="flex gap-2">
                        <span className={`w-6 text-center font-bold ${
                          a.status === 'M' ? 'text-amber-400' :
                          a.status === 'A' ? 'text-emerald-400' :
                          a.status === 'D' ? 'text-red-400' :
                          a.status === '?' ? 'text-zinc-600' :
                          'text-zinc-400'
                        }`}>{a.status || ' '}</span>
                        <span className="text-zinc-300">{a.arquivo}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 mt-2">Working tree limpa.</p>
                )}
              </div>
            )
          ) : (
            !gitBranches ? (
              <p className="text-sm text-zinc-500">Sem dados de branches.</p>
            ) : (
              <div className="space-y-1 text-xs font-mono">
                {gitBranches.branches?.map((b: string) => (
                  <div key={b} className="flex items-center gap-2">
                    {b === gitBranches.atual ? (
                      <span className="text-[#5b7cfa]">●</span>
                    ) : (
                      <span className="text-zinc-700">○</span>
                    )}
                    <span className={b === gitBranches.atual ? 'text-zinc-100 font-semibold' : 'text-zinc-400'}>
                      {b}
                    </span>
                    {b === gitBranches.atual && (
                      <span className="text-[#5b7cfa] text-[10px]">(HEAD)</span>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </Modal>

      {/* Modal de Commits */}
      {commitsModalServico && (
        <CommitsModal
          servicoId={commitsModalServico.id}
          projetoId={projetoId}
          nomeServico={commitsModalServico.nome}
          branchAtual={gitBranches?.atual}
          aoFechar={() => setCommitsModalServico(null)}
          aoAtualizar={() => carregarServicos()}
        />
      )}

      {/* Modal de edição de serviço */}
      {servicoEditando && (
        <EditarServicoModal
          servico={servicoEditando}
          projetoId={projetoId}
          aoFechar={() => setServicoEditando(null)}
          aoAtualizar={() => carregarServicos()}
        />
      )}
    </div>
  );
}
