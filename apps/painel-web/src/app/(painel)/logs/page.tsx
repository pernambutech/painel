'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, RefreshCw, Terminal } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { servicosApi } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { LogServico, Servico } from '@/types';

const tiposLog = ['todos', 'stdout', 'stderr'] as const;
type TipoLog = (typeof tiposLog)[number];
const linhasDisponiveis = [50, 100, 200] as const;

export default function LogsPage() {
  const { organizacao } = useAuth();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState('');
  const [logs, setLogs] = useState<LogServico[]>([]);
  const [tipo, setTipo] = useState<TipoLog>('todos');
  const [linhas, setLinhas] = useState<(typeof linhasDisponiveis)[number]>(100);
  const [carregandoServicos, setCarregandoServicos] = useState(true);
  const [carregandoLogs, setCarregandoLogs] = useState(false);
  const [erro, setErro] = useState('');

  const servicoSelecionado = servicos.find((servico) => servico.id === servicoSelecionadoId);

  useEffect(() => {
    const carregarServicos = async () => {
      if (!organizacao) return;

      try {
        setCarregandoServicos(true);
        setErro('');
        const dados = await servicosApi.listarTodos(organizacao.id);
        setServicos(dados || []);
      } catch {
        setErro('Não foi possível carregar os serviços.');
      } finally {
        setCarregandoServicos(false);
      }
    };

    carregarServicos();
  }, [organizacao]);

  const carregarLogs = async (
    servico = servicoSelecionado,
    tipoSelecionado = tipo,
    linhasSelecionadas = linhas,
  ) => {
    if (!organizacao || !servico) return;

    try {
      setCarregandoLogs(true);
      setErro('');
      const dados = await servicosApi.obterLogs(organizacao.id, servico.projetoId, servico.id, {
        tipo: tipoSelecionado,
        linhas: linhasSelecionadas,
      });
      setLogs((dados.logs || []) as LogServico[]);
    } catch (erroResposta: unknown) {
      setLogs([]);
      setErro(
        axios.isAxiosError(erroResposta)
          ? erroResposta.response?.data?.message || 'Não foi possível obter os logs do serviço.'
          : 'Não foi possível obter os logs do serviço.',
      );
    } finally {
      setCarregandoLogs(false);
    }
  };

  const selecionarServico = (servicoId: string) => {
    const servico = servicos.find((item) => item.id === servicoId);
    setServicoSelecionadoId(servicoId);
    setLogs([]);
    if (servico) carregarLogs(servico);
  };

  const alterarTipo = (novoTipo: TipoLog) => {
    setTipo(novoTipo);
    carregarLogs(servicoSelecionado, novoTipo);
  };

  const alterarLinhas = (novasLinhas: (typeof linhasDisponiveis)[number]) => {
    setLinhas(novasLinhas);
    carregarLogs(servicoSelecionado, tipo, novasLinhas);
  };

  if (carregandoServicos) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Spinner tamanho="grande" />
        <p className="text-sm text-zinc-500">Carregando serviços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.4px' }} className="text-zinc-100">Logs</h1>
        <p className="mt-1 text-sm" style={{ color: '#a8a8b3' }}>Visualize logs dos serviços.</p>
      </header>

      {erro && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {erro}
        </div>
      )}

      {servicos.length === 0 ? (
        <Card>
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <Terminal className="mb-3 h-9 w-9 text-zinc-700" />
            <p className="text-sm text-zinc-400">Nenhum serviço cadastrado.</p>
            <p className="mt-1 text-xs text-zinc-600">
              Cadastre um serviço e associe-o a um ambiente para consultar seus logs.
            </p>
          </div>
        </Card>
      ) : (
        <Card padding="nenhum" className="overflow-hidden">
          <div className="border-b border-[#2a2a32] px-5 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#8ca2ff]" />
              <h2 className="text-base font-semibold text-zinc-100">Saída do serviço</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <select
                aria-label="Serviço"
                value={servicoSelecionadoId}
                onChange={(evento) => selecionarServico(evento.target.value)}
                className="w-full rounded-lg border border-[#2a2a32] bg-[#17171c] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#5b7cfa]"
              >
                <option value="">Selecione um serviço</option>
                {servicos.map((servico) => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome}
                    {servico.ambiente ? ` — ${servico.ambiente.nome}` : ''}
                  </option>
                ))}
              </select>
              <Button
                variante="secundario"
                onClick={() => carregarLogs()}
                disabled={!servicoSelecionado}
                carregando={carregandoLogs}
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </div>

          {servicoSelecionado && (
            <div className="flex flex-wrap items-center gap-2 border-b border-[#2a2a32] px-5 py-3">
              <span className="mr-1 text-xs text-zinc-500">Fonte:</span>
              {tiposLog.map((tipoItem) => (
                <button
                  key={tipoItem}
                  type="button"
                  onClick={() => alterarTipo(tipoItem)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${tipo === tipoItem ? 'bg-[#5b7cfa] text-white' : 'bg-[#24242b] text-zinc-400 hover:bg-[#303039]'}`}
                >
                  {tipoItem}
                </button>
              ))}
              <span className="ml-3 mr-1 text-xs text-zinc-500">Linhas:</span>
              {linhasDisponiveis.map((quantidade) => (
                <button
                  key={quantidade}
                  type="button"
                  onClick={() => alterarLinhas(quantidade)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${linhas === quantidade ? 'bg-[#5b7cfa] text-white' : 'bg-[#24242b] text-zinc-400 hover:bg-[#303039]'}`}
                >
                  {quantidade}
                </button>
              ))}
            </div>
          )}

          <div className="min-h-80 bg-[#0a0a0e] p-5">
            {!servicoSelecionado ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <Terminal className="mb-3 h-9 w-9 text-zinc-700" />
                <p className="text-sm text-zinc-400">
                  Selecione um serviço para visualizar os logs.
                </p>
              </div>
            ) : carregandoLogs ? (
              <div className="flex min-h-64 items-center justify-center">
                <Spinner />
              </div>
            ) : logs.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <Terminal className="mb-3 h-9 w-9 text-zinc-700" />
                <p className="text-sm text-zinc-400">Nenhum log encontrado.</p>
                <p className="mt-1 text-xs text-zinc-600">
                  Inicie o serviço para gerar novas entradas.
                </p>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-auto font-mono text-xs leading-6">
                {logs.map((log, indice) => (
                  <div
                    key={`${log.timestamp}-${indice}`}
                    className={log.nivel === 'error' ? 'text-red-300' : 'text-zinc-300'}
                  >
                    <span className="mr-2 text-zinc-600">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                    {log.fonte && (
                      <span
                        className={`mr-2 ${log.fonte === 'stderr' ? 'text-red-400' : 'text-sky-400'}`}
                      >
                        [{log.fonte}]
                      </span>
                    )}
                    <span className="whitespace-pre-wrap break-words">{log.mensagem}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
