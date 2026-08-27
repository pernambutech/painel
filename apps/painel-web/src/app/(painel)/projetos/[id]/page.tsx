// Página de detalhes de um projeto
// Exibe informações, permite editar e arquivar/reativar

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { projetosApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BadgeSimples } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import {
  ArrowLeft,
  Archive,
  ArchiveRestore,
  CalendarDays,
  Check,
  Edit3,
  FileText,
  FolderKanban,
  X,
} from 'lucide-react';
import type { Projeto } from '@/types';

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

  useEffect(() => {
    if (organizacao && projetoId) {
      carregarProjeto();
    }
  }, [organizacao, projetoId]);

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
              <Button variante="secundario" tamanho="pequeno" onClick={reativarProjeto} carregando={salvando}>
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
              <Button
                variante="fantasma"
                tamanho="pequeno"
                onClick={() => setEditando(false)}
              >
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
              <FileText className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Serviços</p>
              <p className="text-sm font-medium text-zinc-200">Nenhum serviço configurado</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Seção de serviços (placeholder) */}
      <Card>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Serviços do projeto</h2>
        <div className="text-center py-8">
          <FileText className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Nenhum serviço configurado neste projeto.</p>
          <p className="text-xs text-zinc-600 mt-1">
            Os serviços serão adicionados na próxima etapa do produto.
          </p>
        </div>
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
    </div>
  );
}