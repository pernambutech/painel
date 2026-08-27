// Página de detalhes de um ambiente

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { ambientesApi, agentesApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import {
  ArrowLeft,
  Monitor,
  Clock,
  Cpu,
  Edit3,
  Trash2,
  X,
  Check,
  Wifi,
  WifiOff,
  Copy,
  Terminal,
} from 'lucide-react';
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
  const [tokenAgente, setTokenAgente] = useState('');
  const [carregandoToken, setCarregandoToken] = useState(false);
  const [tokenCopiado, setTokenCopiado] = useState(false);
  const [comandoCopiado, setComandoCopiado] = useState<string | null>(null);

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

  const gerarTokenAgente = async () => {
    if (!organizacao || !ambiente) return;

    try {
      setCarregandoToken(true);
      const dados = await agentesApi.gerarToken(organizacao.id, ambiente.id);
      setTokenAgente(dados.token);
    } catch (err) {
      setErro('Erro ao gerar token do agente.');
    } finally {
      setCarregandoToken(false);
    }
  };

  const copiarToken = async () => {
    try {
      await navigator.clipboard.writeText(tokenAgente);
      setTokenCopiado(true);
      setTimeout(() => setTokenCopiado(false), 2000);
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = tokenAgente;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setTokenCopiado(true);
      setTimeout(() => setTokenCopiado(false), 2000);
    }
  };

  const copiarTexto = async (texto: string, id: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setComandoCopiado(id);
      setTimeout(() => setComandoCopiado(null), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = texto;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setComandoCopiado(id);
      setTimeout(() => setComandoCopiado(null), 2000);
    }
  };

  const obterUrlApi = () => {
    // Usa a mesma URL que o frontend usa para falar com a API
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    return 'http://localhost:3001';
  };

  const obterComandoWindows = () => {
    const urlApi = obterUrlApi();
    return `$env:AGENT_TOKEN="${tokenAgente}"\n$env:AGENT_API_URL="${urlApi}"\nSet-Location "C:\\caminho\\do\\agente"\nnpx tsx src/index.ts`;
  };

  const obterComandoLinux = () => {
    const urlApi = obterUrlApi();
    return `AGENT_TOKEN="${tokenAgente}" AGENT_API_URL="${urlApi}" npx tsx src/index.ts`;
  };

  const obterComandoWindowsUmaLinha = () => {
    const urlApi = obterUrlApi();
    return `$env:AGENT_TOKEN="${tokenAgente}"; $env:AGENT_API_URL="${urlApi}"; npx tsx src/index.ts`;
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

  const obterVarianteAgente = (status: string | undefined) => {
    switch (status) {
      case 'online':
        return 'online';
      case 'offline':
        return 'offline';
      case 'manutencao':
        return 'aviso';
      default:
        return 'neutro';
    }
  };

  const obterTextoAgente = (status: string | undefined) => {
    switch (status) {
      case 'online':
        return 'Conectado';
      case 'offline':
        return 'Desconectado';
      case 'manutencao':
        return 'Manutenção';
      default:
        return 'Desconhecido';
    }
  };

  const obterTempoHeartbeat = (agente: Ambiente['agente']) => {
    if (!agente?.ultimoHeartbeat) return null;
    const agora = new Date();
    const heartbeat = new Date(agente.ultimoHeartbeat);
    const diferencaSegundos = Math.floor((agora.getTime() - heartbeat.getTime()) / 1000);

    if (diferencaSegundos < 60) {
      return `Há ${diferencaSegundos}s`;
    } else if (diferencaSegundos < 3600) {
      return `Há ${Math.floor(diferencaSegundos / 60)}min`;
    } else {
      return `Há ${Math.floor(diferencaSegundos / 3600)}h`;
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

  const agente = ambiente.agente;
  const agenteOnline = agente?.status === 'online';

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
            <Badge variante={obterVarianteAgente(agente?.status)}>
              {obterTextoAgente(agente?.status)}
            </Badge>
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

      {/* Seção 1 - Informações do Ambiente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800">
              {agenteOnline ? (
                <Wifi className="w-4 h-4 text-emerald-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-zinc-400" />
              )}
            </div>
            <div>
              <p className="text-xs text-zinc-500">Status do Agente</p>
              <p className="text-sm font-medium text-zinc-200">
                {obterTextoAgente(agente?.status)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800">
              <Clock className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Último Heartbeat</p>
              <p className="text-sm font-medium text-zinc-200">
                {agente?.ultimoHeartbeat ? obterTempoHeartbeat(agente) : 'Nenhum'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800">
              <Cpu className="w-4 h-4 text-zinc-400" />
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

      {/* Seção 2 - Agente */}
      {agente ? (
        <Card>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Agente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1">ID do Agente</p>
              <p className="text-sm font-mono text-zinc-300">{agente.id}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Versão</p>
              <p className="text-sm text-zinc-300">{agente.versao || 'Desconhecida'}</p>
            </div>
            {agenteOnline && (
              <>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">CPU</p>
                  <p className="text-sm text-zinc-300">{agente.cpuUso?.toFixed(1) || '0'}%</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Memória</p>
                  <p className="text-sm text-zinc-300">
                    {agente.memoriaUso && agente.memoriaTotal
                      ? `${((agente.memoriaUso / agente.memoriaTotal) * 100).toFixed(1)}%`
                      : 'N/A'}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Agente</h2>
          <div className="text-center py-6">
            <Terminal className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 mb-4">Agente não instalado neste ambiente.</p>

            {!tokenAgente ? (
              <Button onClick={gerarTokenAgente} carregando={carregandoToken}>
                Gerar Token de Instalação
              </Button>
            ) : (
              <div className="mx-auto max-w-2xl space-y-4 text-left">
                {/* Alerta */}
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                  <p className="text-xs font-medium text-amber-300">Token gerado — copie agora</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Este token só é exibido uma vez. Guarde em local seguro. Se exposto, gere um novo.
                  </p>
                </div>

                {/* Token */}
                <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-zinc-400">Token do agente</p>
                    <Button
                      variante="fantasma"
                      tamanho="pequeno"
                      onClick={copiarToken}
                      title="Copiar token"
                    >
                      {tokenCopiado ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <code className="block break-all rounded bg-zinc-900 p-3 text-sm font-mono text-emerald-300">
                    {tokenAgente}
                  </code>
                </div>

                {/* Comando Windows */}
                <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-zinc-400">
                      Windows — PowerShell (recomendado)
                    </p>
                    <Button
                      variante="fantasma"
                      tamanho="pequeno"
                      onClick={() => copiarTexto(obterComandoWindowsUmaLinha(), 'win')}
                      title="Copiar comando Windows"
                    >
                      {comandoCopiado === 'win' ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="mb-2 text-xs text-zinc-500">
                    Cole no PowerShell <strong className="text-zinc-300">na máquina que quer controlar</strong>:
                  </p>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded bg-zinc-900 p-3 text-xs font-mono text-zinc-200">
                    {obterComandoWindows()}
                  </pre>
                  <p className="mt-2 text-xs text-zinc-500">
                    Linha única para copiar e colar direto:
                  </p>
                  <code className="mt-1 block break-all rounded bg-zinc-900 p-2 text-xs font-mono text-zinc-300">
                    {obterComandoWindowsUmaLinha()}
                  </code>
                </div>

                {/* Comando Linux */}
                <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-zinc-400">Linux / macOS — bash</p>
                    <Button
                      variante="fantasma"
                      tamanho="pequeno"
                      onClick={() => copiarTexto(obterComandoLinux(), 'linux')}
                      title="Copiar comando Linux"
                    >
                      {comandoCopiado === 'linux' ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded bg-zinc-900 p-3 text-xs font-mono text-zinc-200">
                    {obterComandoLinux()}
                  </pre>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button variante="fantasma" tamanho="pequeno" onClick={() => setTokenAgente('')}>
                    Gerar novo token
                  </Button>
                  <span className="text-xs text-zinc-500">
                    Se a API não for localhost, troque a URL em{' '}
                    <code className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-300">AGENT_API_URL</code>
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Seção 3 - Serviços */}
      <Card>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Serviços</h2>
        <div className="text-center py-8">
          <Monitor className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Nenhum serviço configurado neste ambiente.</p>
          <p className="text-xs text-zinc-600 mt-1">
            {agenteOnline
              ? 'Adicione um projeto para começar.'
              : 'Conecte o agente para gerenciar serviços.'}
          </p>
        </div>
      </Card>

      {/* Seção 4 - Métricas (Placeholder) */}
      <Card>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Métricas do Sistema</h2>
        <div className="text-center py-6">
          <p className="text-sm text-zinc-500">Métricas detalhadas disponíveis em breve.</p>
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
