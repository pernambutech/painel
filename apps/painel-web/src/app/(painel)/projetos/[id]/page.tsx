// Página de detalhes de um projeto
// Exibe informações, permite editar e arquivar/reativar

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { projetosApi, servicosApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  Edit3,
  FileText,
  FolderKanban,
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
import type { Projeto, Servico } from '@/types';

export default function ProjetoDetalhePage() {
  const params = useParams();
  const { organizacao } = useAuth();

  const projetoId = params.id as string;

  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [editando, setEditando] = useState(false);
  const [nomeEditado, setNomeEditado] = useState('');
  const [descricaoEditada, setDescricaoEditada] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [confirmandoArquivamento, setConfirmandoArquivamento] = useState(false);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregandoServicos, setCarregandoServicos] = useState(true);
  const [servicoParaRemover, setServicoParaRemover] = useState<Servico | null>(null);
  const [statusPorServico, setStatusPorServico] = useState<Record<string, any>>({});
  const [controleCarregando, setControleCarregando] = useState<string | null>(null);
  const [logsModalServico, setLogsModalServico] = useState<Servico | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [carregandoLogs, setCarregandoLogs] = useState(false);
  const [tipoLog, setTipoLog] = useState<'todos' | 'stdout' | 'stderr'>('todos');
  const [erroLogs, setErroLogs] = useState('');

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
            setStatusPorServico((prev) => ({ ...prev, [s.id]: { status: 'desconhecido' } }));
          });
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
      setErro(err.response?.data?.message || `Erro ao ${acao} serviço.`);
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

  const carregarProjeto = async () => {
    if (!organizacao) return;

    try {
      setCarregando(true);
      const dados = await projetosApi.obterPorId(organizacao.id, projetoId);
      setProjeto(dados);
      setNomeEditado(dados.nome);
      setDescricaoEditada(dados.descricao || '');
    } catch (err) {
      setErro('Erro ao carregar projeto.');
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
      setErro('Erro ao salvar alterações.');
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
      setErro('Erro ao arquivar projeto.');
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
      setErro('Erro ao reativar projeto.');
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
      setErro('Erro ao remover serviço.');
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

      {/* Erro */}
      {erro && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{erro}</p>
          <Button variante="fantasma" tamanho="pequeno" onClick={carregarProjeto}>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Serviços do projeto</h2>
          <Link href={`/projetos/${projetoId}/servicos/novo`}>
            <Button tamanho="pequeno">
              <Plus className="w-4 h-4" />
              Adicionar serviço
            </Button>
          </Link>
        </div>

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
                  : estado === 'offline'
                    ? 'offline'
                    : estado === 'erro'
                      ? 'erro'
                      : 'neutro';
              const carregandoAcao = controleCarregando?.endsWith(servico.id);
              return (
                <div
                  key={servico.id}
                  className="flex flex-col gap-3 rounded-lg border border-[#2a2a32] bg-[#17171c] p-4 sm:flex-row sm:items-center sm:justify-between"
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
                      {status?.reinicios !== undefined && status.reinicios > 0 && (
                        <span className="text-xs text-amber-400">{status.reinicios} reinícios</span>
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
                      {status?.uptimeMs !== undefined && (
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" /> {Math.floor(status.uptimeMs / 1000)}s
                          ativo
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variante="fantasma"
                      tamanho="pequeno"
                      title="Iniciar"
                      onClick={() => controlarServico(servico.id, 'iniciar')}
                      carregando={controleCarregando === `iniciar-${servico.id}`}
                      disabled={!!carregandoAcao}
                    >
                      <Play className="w-4 h-4 text-emerald-400" />
                    </Button>
                    <Button
                      variante="fantasma"
                      tamanho="pequeno"
                      title="Parar"
                      onClick={() => controlarServico(servico.id, 'parar')}
                      carregando={controleCarregando === `parar-${servico.id}`}
                      disabled={!!carregandoAcao}
                    >
                      <Square className="w-4 h-4 text-amber-400" />
                    </Button>
                    <Button
                      variante="fantasma"
                      tamanho="pequeno"
                      title="Reiniciar"
                      onClick={() => controlarServico(servico.id, 'reiniciar')}
                      carregando={controleCarregando === `reiniciar-${servico.id}`}
                      disabled={!!carregandoAcao}
                    >
                      <RotateCw className="w-4 h-4 text-blue-400" />
                    </Button>
                    <Button
                      variante="fantasma"
                      tamanho="pequeno"
                      title="Ver logs"
                      onClick={() => abrirLogs(servico)}
                    >
                      <FileText className="w-4 h-4 text-zinc-400" />
                    </Button>
                    <div className="ml-1 h-6 w-px bg-[#2a2a32]" />
                    <Button
                      variante="fantasma"
                      tamanho="pequeno"
                      onClick={() => setServicoParaRemover(servico)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal de confirmação de arquivamento */}
      {confirmandoArquivamento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
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
          </Card>
        </div>
      )}

      {/* Modal de confirmação de remoção de serviço */}
      {servicoParaRemover && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Remover serviço?</h3>
            <p className="text-sm text-zinc-500 mb-6">
              O serviço <strong className="text-zinc-300">{servicoParaRemover.nome}</strong> será
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
          </Card>
        </div>
      )}

      {/* Modal de logs */}
      {logsModalServico && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="flex max-h-[80vh] w-full max-w-3xl flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">
                Logs — {logsModalServico.nome}
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
                    carregarLogs(logsModalServico, t);
                  }}
                  className={`rounded-lg px-3 py-1 text-xs font-medium ${tipoLog === t ? 'bg-[#5b7cfa] text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                  {t}
                </button>
              ))}
              <Button
                variante="fantasma"
                tamanho="pequeno"
                onClick={() => carregarLogs(logsModalServico, tipoLog)}
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
            <div className="flex-1 overflow-auto rounded-lg border border-[#2a2a32] bg-[#0d0d0f] p-4">
              {carregandoLogs ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : logs.length === 0 ? (
                <p className="text-sm text-zinc-500">Nenhum log encontrado.</p>
              ) : (
                <div className="space-y-1 text-xs font-mono">
                  {logs.map((l: any, i: number) => (
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
          </Card>
        </div>
      )}
    </div>
  );
}
