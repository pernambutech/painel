// Página de listagem de projetos

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { projetosApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BadgeSimples } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { FolderKanban, Plus, Archive, FileText, CalendarDays } from 'lucide-react';
import type { Projeto } from '@/types';

export default function ProjetosPage() {
  const { organizacao } = useAuth();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarProjetos();
  }, [organizacao, mostrarArquivados]);

  const carregarProjetos = async () => {
    if (!organizacao) return;

    try {
      setCarregando(true);
      const dados = await projetosApi.listar(organizacao.id, mostrarArquivados);
      setProjetos(dados || []);
    } catch (err) {
      setErro('Erro ao carregar projetos.');
    } finally {
      setCarregando(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Spinner tamanho="grande" />
          <p className="text-sm text-zinc-500">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Projetos</h1>
          <p className="text-sm text-zinc-500 mt-1">Gerencie seus projetos e serviços</p>
        </div>
        <Link href="/projetos/novo">
          <Button>
            <Plus className="w-4 h-4" />
            Novo Projeto
          </Button>
        </Link>
      </div>

      {/* Filtro de arquivados */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMostrarArquivados((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            mostrarArquivados
              ? 'border-[#5b7cfa] bg-[#5b7cfa]/10 text-[#8ca2ff]'
              : 'border-[#2a2a32] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          {mostrarArquivados ? 'Ocultando arquivados' : 'Mostrar arquivados'}
        </button>
      </div>

      {/* Erro */}
      {erro && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{erro}</p>
          <Button variante="fantasma" tamanho="pequeno" onClick={carregarProjetos}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Estado vazio */}
      {!carregando && projetos.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <FolderKanban className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              {mostrarArquivados ? 'Nenhum projeto arquivado' : 'Nenhum projeto cadastrado'}
            </h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              {mostrarArquivados
                ? 'Projetos arquivados aparecerão aqui.'
                : 'Crie seu primeiro projeto para começar a organizar seus serviços.'}
            </p>
            {!mostrarArquivados && (
              <Link href="/projetos/novo" className="inline-flex mt-4">
                <Button>
                  <Plus className="w-4 h-4" />
                  Adicionar projeto
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}

      {/* Lista de projetos */}
      {projetos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projetos.map((projeto) => (
            <Link key={projeto.id} href={`/projetos/${projeto.id}`}>
              <Card
                className={`group h-full cursor-pointer transition-colors hover:border-zinc-600 ${
                  !projeto.ativo ? 'opacity-70' : ''
                }`}
              >
                <div className="flex flex-col h-full">
                  {/* Cabeçalho do card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e1e24]">
                        <FolderKanban className="w-5 h-5 text-[#8ca2ff]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-zinc-100 group-hover:text-white">
                          {projeto.nome}
                        </h3>
                        <p className="text-xs text-zinc-500">Projeto</p>
                      </div>
                    </div>
                    {!projeto.ativo && (
                      <BadgeSimples variante="neutro">Arquivado</BadgeSimples>
                    )}
                  </div>

                  {/* Descrição */}
                  {projeto.descricao && (
                    <p className="mb-4 text-sm text-zinc-400 line-clamp-2">{projeto.descricao}</p>
                  )}

                  {/* Informações */}
                  <div className="mt-auto pt-4 border-t border-[#2a2a32]">
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{projeto.totalServicos ?? 0} {(projeto.totalServicos ?? 0) === 1 ? 'serviço' : 'serviços'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        <span>{formatarData(projeto.criadoEm)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}