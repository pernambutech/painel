// Modal de histórico de commits de um serviço
// Permite visualizar commits, navegar e restaurar versões anteriores

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { servicosApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  X,
  GitCommit,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  User,
  ArrowLeft,
} from 'lucide-react';

interface Commit {
  hash: string;
  autor: string;
  data: string;
  mensagem: string;
}

interface CommitsModalProps {
  servicoId: string;
  projetoId: string;
  nomeServico: string;
  branchAtual?: string;
  aoFechar: () => void;
  aoAtualizar?: () => void;
}

const COMMITS_POR_PAGINA = 15;

export function CommitsModal({
  servicoId,
  projetoId,
  nomeServico,
  branchAtual,
  aoFechar,
  aoAtualizar,
}: CommitsModalProps) {
  const { organizacao } = useAuth();

  const [commits, setCommits] = useState<Commit[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [pagina, setPagina] = useState(0);
  const [temAlteracoes, setTemAlteracoes] = useState(false);
  const [restaurando, setRestaurando] = useState<string | null>(null);
  const [voltandoAoLatest, setVoltandoAoLatest] = useState(false);
  const [confirmarVoltar, setConfirmarVoltar] = useState(false);

  const totalPaginas = Math.ceil(commits.length / COMMITS_POR_PAGINA);
  const commitsVisiveis = commits.slice(
    pagina * COMMITS_POR_PAGINA,
    (pagina + 1) * COMMITS_POR_PAGINA,
  );

  const carregarCommits = useCallback(async () => {
    if (!organizacao) return;
    try {
      setCarregando(true);
      setErro('');
      const dados = await servicosApi.gitLog(organizacao.id, projetoId, servicoId, 200);
      setCommits(dados.commits || []);
      setTemAlteracoes(dados.temAlteracoes || false);
      setPagina(0);
    } catch (err: any) {
      setErro(err?.response?.data?.message || err?.message || 'Erro ao carregar commits.');
    } finally {
      setCarregando(false);
    }
  }, [organizacao, projetoId, servicoId]);

  useEffect(() => {
    carregarCommits();
  }, [carregarCommits]);

  const restaurarCommit = async (hash: string) => {
    if (!organizacao) return;
    try {
      setRestaurando(hash);
      await servicosApi.gitCheckout(organizacao.id, projetoId, servicoId, hash);
      aoAtualizar?.();
      await carregarCommits();
    } catch (err: any) {
      setErro(err?.response?.data?.message || err?.message || 'Erro ao restaurar commit.');
    } finally {
      setRestaurando(null);
    }
  };

  const voltarAoLatest = async () => {
    if (!organizacao || !branchAtual) return;
    try {
      setVoltandoAoLatest(true);
      await servicosApi.gitCheckoutBranch(organizacao.id, projetoId, servicoId, branchAtual);
      aoAtualizar?.();
      await carregarCommits();
    } catch (err: any) {
      setErro(err?.response?.data?.message || err?.message || 'Erro ao voltar para branch.');
    } finally {
      setVoltandoAoLatest(false);
      setConfirmarVoltar(false);
    }
  };

  const formatarData = (data: string) => {
    try {
      const d = new Date(data);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return data;
    }
  };

  const formatarHash = (hash: string) => hash.slice(0, 7);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="flex max-h-[85vh] w-full max-w-4xl flex-col">
        {/* Cabeçalho */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitCommit className="w-5 h-5 text-[#8ca2ff]" />
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">
                Commits — {nomeServico}
              </h3>
              {branchAtual && (
                <p className="text-xs text-zinc-500">
                  Branch: <span className="text-[#8ca2ff]">{branchAtual}</span>
                </p>
              )}
            </div>
          </div>
          <Button variante="fantasma" tamanho="pequeno" onClick={aoFechar}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Aviso de alterações não commitadas */}
        {temAlteracoes && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Existem alterações não commitadas neste serviço.
          </div>
        )}

        {/* Botão voltar ao latest */}
        {commits.length > 0 && (
          <div className="mb-3 flex items-center justify-between">
            <Button
              variante="secundario"
              tamanho="pequeno"
              onClick={() => setConfirmarVoltar(true)}
              carregando={voltandoAoLatest}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao último commit
            </Button>
            <Button
              variante="fantasma"
              tamanho="pequeno"
              onClick={carregarCommits}
              carregando={carregando}
            >
              Atualizar
            </Button>
          </div>
        )}

        {/* Confirmação de voltar ao latest */}
        {confirmarVoltar && (
          <div className="mb-3 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3">
            <p className="text-sm text-blue-300 mb-2">
              Voltar para a branch <strong>{branchAtual}</strong>?
            </p>
            <div className="flex gap-2">
              <Button tamanho="pequeno" onClick={voltarAoLatest} carregando={voltandoAoLatest}>
                Sim, voltar
              </Button>
              <Button
                variante="fantasma"
                tamanho="pequeno"
                onClick={() => setConfirmarVoltar(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {erro}
          </div>
        )}

        {/* Lista de commits */}
        <div className="flex-1 overflow-auto rounded-lg border border-[#2a2a32] bg-[#0d0d0f]">
          {carregando ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : commits.length === 0 ? (
            <div className="py-12 text-center">
              <GitCommit className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">Nenhum commit encontrado.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1a1a22]">
              {commitsVisiveis.map((commit) => (
                <div
                  key={commit.hash}
                  className="flex items-start justify-between gap-4 px-4 py-3 hover:bg-[#14141c] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-[#8ca2ff] bg-[#5b7cfa]/10 px-1.5 py-0.5 rounded">
                        {formatarHash(commit.hash)}
                      </span>
                      <span className="text-xs text-zinc-400 truncate">{commit.mensagem}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-600">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {commit.autor}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatarData(commit.data)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variante="fantasma"
                    tamanho="pequeno"
                    onClick={() => restaurarCommit(commit.hash)}
                    carregando={restaurando === commit.hash}
                    disabled={restaurando !== null}
                    title="Restaurar este commit"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="mt-3 flex items-center justify-center gap-3">
            <Button
              variante="fantasma"
              tamanho="pequeno"
              onClick={() => setPagina((p) => Math.max(0, p - 1))}
              disabled={pagina === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-zinc-500">
              Página {pagina + 1} de {totalPaginas}
            </span>
            <Button
              variante="fantasma"
              tamanho="pequeno"
              onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
              disabled={pagina >= totalPaginas - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
