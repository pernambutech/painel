// Página de detalhes de um ambiente

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { ambientesApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Monitor, Server, Clock, Cpu, Edit3, Trash2, X, Check } from 'lucide-react';
import type { Ambiente } from '@/types';

export default function AmbienteDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { organizacao } = useAuth();

  const ambienteId = params.id as string;

  const [ambiente, setAmbiente] = useState<Ambiente | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [editando, setEditando] = useState(false);
  const [nomeEditado, setNomeEditado] = useState('');
  const [tipoEditado, setTipoEditado] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  useEffect(() => {
    if (organizacao && ambienteId) {
      carregarAmbiente();
    }
  }, [organizacao, ambienteId]);

  const carregarAmbiente = async () => {
    if (!organizacao) return;

    try {
      setCarregando(true);
      const dados = await ambientesApi.obterPorId(organizacao.id, ambienteId);
      setAmbiente(dados);
      setNomeEditado(dados.nome);
      setTipoEditado(dados.tipo);
    } catch (err) {
      setErro('Erro ao carregar ambiente.');
    } finally {
      setCarregando(false);
    }
  };

  const salvarEdicao = async () => {
    if (!organizacao || !ambiente) return;

    try {
      setSalvando(true);
      await ambientesApi.atualizar(organizacao.id, ambiente.id, {
        nome: nomeEditado,
        tipo: tipoEditado,
      });
      setAmbiente({ ...ambiente, nome: nomeEditado, tipo: tipoEditado });
      setEditando(false);
    } catch (err) {
      setErro('Erro ao salvar alterações.');
    } finally {
      setSalvando(false);
    }
  };

  const excluirAmbiente = async () => {
    if (!organizacao || !ambiente) return;

    try {
      setSalvando(true);
      await ambientesApi.remover(organizacao.id, ambiente.id);
      router.push('/ambientes');
    } catch (err) {
      setErro('Erro ao excluir ambiente.');
    } finally {
      setSalvando(false);
    }
  };

  const obterIconeSO = (so: string) => {
    switch (so.toLowerCase()) {
      case 'windows':
        return '🪟';
      case 'linux':
        return '🐧';
      case 'macos':
        return '🍎';
      default:
        return '💻';
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Spinner tamanho="grande" />
          <p className="text-sm text-zinc-500">Carregando ambiente...</p>
        </div>
      </div>
    );
  }

  if (!ambiente) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Ambiente não encontrado.</p>
        <Link
          href="/ambientes"
          className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block"
        >
          Voltar para ambientes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div>
        <Link
          href="/ambientes"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{obterIconeSO(ambiente.sistemaOperacional)}</div>
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
                      setNomeEditado(ambiente.nome);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-zinc-100">{ambiente.nome}</h1>
                  <Button variante="fantasma" tamanho="pequeno" onClick={() => setEditando(true)}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-zinc-500 mt-1">
                {ambiente.sistemaOperacional} • {ambiente.tipo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variante="offline">Offline</Badge>
            <Button
              variante="perigo"
              tamanho="pequeno"
              onClick={() => setConfirmandoExclusao(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{erro}</p>
        </div>
      )}

      {/* Informações do ambiente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800">
              <Server className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Status</p>
              <p className="text-sm font-medium text-zinc-200">Offline</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800">
              <Cpu className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Agente</p>
              <p className="text-sm font-medium text-zinc-200">Não conectado</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800">
              <Clock className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Criado em</p>
              <p className="text-sm font-medium text-zinc-200">
                {new Date(ambiente.criadoEm).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Serviços */}
      <Card>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Serviços</h2>
        <div className="text-center py-8">
          <Monitor className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Nenhum serviço configurado neste ambiente.</p>
          <p className="text-xs text-zinc-600 mt-1">
            Conecte o agente para começar a gerenciar serviços.
          </p>
        </div>
      </Card>

      {/* Modal de confirmação de exclusão */}
      {confirmandoExclusao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Excluir ambiente?</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Esta ação não pode ser desfeita. Todos os dados associados serão perdidos.
            </p>
            <div className="flex gap-3">
              <Button
                variante="secundario"
                larguraTotal
                onClick={() => setConfirmandoExclusao(false)}
              >
                Cancelar
              </Button>
              <Button
                variante="perigo"
                larguraTotal
                onClick={excluirAmbiente}
                carregando={salvando}
              >
                Excluir
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
