// Página de logs
// Terminal estilizado com filtros de nível e quantidade de linhas

'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Terminal, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { servicosApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { TerminalLog } from '@/components/ui/TerminalLog';
import type { LogServico, Servico } from '@/types';

// ===========================================
// CONSTANTES
// ===========================================

const opcoesNivel = [
  { chave: 'todos', rotulo: 'Ver tudo' },
  { chave: 'ok', rotulo: 'Ver OK' },
  { chave: 'falhas', rotulo: 'Ver falhas' },
] as const;

const opcoesLinhas = [10, 25, 50, 100, 200, 0] as const; // 0 = todos

type FiltroNivel = (typeof opcoesNivel)[number]['chave'];

// ===========================================
// COMPONENTE
// ===========================================

export default function LogsPage() {
  const { organizacao } = useAuth();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState('');
  const [logs, setLogs] = useState<LogServico[]>([]);
  const [carregandoServicos, setCarregandoServicos] = useState(true);
  const [carregandoLogs, setCarregandoLogs] = useState(false);
  const [erro, setErro] = useState('');
  const [filtroNivel, setFiltroNivel] = useState<FiltroNivel>('todos');
  const [qtdLinhas, setQtdLinhas] = useState<(typeof opcoesLinhas)[number]>(100);

  const servicoSelecionado = servicos.find((s) => s.id === servicoSelecionadoId);

  // ===========================================
  // CARREGAR DADOS
  // ===========================================

  useEffect(() => {
    const carregarServicos = async () => {
      if (!organizacao) return;
      try {
        setCarregandoServicos(true);
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

  const carregarLogs = useCallback(async (servico?: Servico, linhas?: number) => {
    const alvo = servico || servicoSelecionado;
    if (!organizacao || !alvo) return;

    const qtdLinhasRequisicao = linhas !== undefined ? linhas : qtdLinhas === 0 ? 9999 : qtdLinhas;

    try {
      setCarregandoLogs(true);
      setErro('');
      const dados = await servicosApi.obterLogs(organizacao.id, alvo.projetoId, alvo.id, {
        tipo: 'todos',
        linhas: qtdLinhasRequisicao,
      });
      setLogs((dados.logs || []) as LogServico[]);
    } catch (erroResposta: unknown) {
      setLogs([]);
      setErro(
        axios.isAxiosError(erroResposta)
          ? erroResposta.response?.data?.message || 'Não foi possível obter os logs.'
          : 'Não foi possível obter os logs.',
      );
    } finally {
      setCarregandoLogs(false);
    }
  }, [organizacao, servicoSelecionado, qtdLinhas]);

  // ===========================================
  // AÇÕES
  // ===========================================

  const selecionarServico = (servicoId: string) => {
    const servico = servicos.find((item) => item.id === servicoId);
    setServicoSelecionadoId(servicoId);
    setLogs([]);
    setErro('');
    if (servico) carregarLogs(servico);
  };

  const alterarLinhas = (qtd: typeof opcoesLinhas[number]) => {
    setQtdLinhas(qtd);
    carregarLogs(servicoSelecionado, qtd === 0 ? 9999 : qtd);
  };

  const recarregar = () => {
    carregarLogs();
  };

  // ===========================================
  // FILTROS CLIENT-SIDE
  // ===========================================

  const logsFiltrados = logs.filter((log) => {
    if (filtroNivel === 'todos') return true;
    if (filtroNivel === 'ok') return log.nivel === 'info' || log.nivel === 'debug';
    if (filtroNivel === 'falhas') return log.nivel === 'error' || log.nivel === 'warn';
    return true;
  });

  // ===========================================
  // ESTADO DE CARREGAMENTO
  // ===========================================

  if (carregandoServicos) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Spinner tamanho="grande" />
        <p className="text-sm" style={{ color: '#6e6e7a' }}>Carregando serviços...</p>
      </div>
    );
  }

  // ===========================================
  // RENDERIZAÇÃO
  // ===========================================

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.4px' }} className="text-zinc-100">Logs</h1>
        <p className="text-sm mt-1" style={{ color: '#a8a8b3' }}>Visualize logs dos serviços.</p>
      </div>

      {/* Erro */}
      {erro && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20" style={{ marginBottom: '16px' }}>
          <p className="text-sm text-red-400">{erro}</p>
        </div>
      )}

      {/* Sem serviços */}
      {servicos.length === 0 ? (
        <div className="rounded-xl border border-[#2a2a32] bg-[#16161a] flex min-h-64 flex-col items-center justify-center px-5 text-center">
          <Terminal className="mb-3 h-9 w-9" style={{ color: '#3a3a44' }} />
          <p className="text-sm" style={{ color: '#a8a8b3' }}>Nenhum serviço cadastrado.</p>
          <p className="mt-1 text-xs" style={{ color: '#6e6e7a' }}>Cadastre um serviço para visualizar seus logs.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2a2a32] bg-[#16161a] overflow-hidden">
          {/* Barra de seleção de serviço */}
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #2a2a32', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <select
              aria-label="Serviço"
              value={servicoSelecionadoId}
              onChange={(evento) => selecionarServico(evento.target.value)}
              style={{
                flex: 1,
                maxWidth: '400px',
                background: '#1e1e24',
                border: '1px solid #2a2a32',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                color: '#ececf0',
                outline: 'none',
              }}
            >
              <option value="">Selecione um serviço</option>
              {servicos.map((servico) => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome}{servico.ambiente ? ` — ${servico.ambiente.nome}` : ''}
                </option>
              ))}
            </select>
            {servicoSelecionado && (
              <button
                type="button"
                onClick={recarregar}
                disabled={carregandoLogs}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: '#1e1e24',
                  border: '1px solid #2a2a32',
                  color: '#a8a8b3',
                  cursor: carregandoLogs ? 'not-allowed' : 'pointer',
                  opacity: carregandoLogs ? 0.5 : 1,
                }}
              >
                <RefreshCw className={`h-3 w-3 ${carregandoLogs ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            )}
          </div>

          {/* Filtros */}
          {servicoSelecionado && (
            <div style={{ padding: '10px 18px', borderBottom: '1px solid #2a2a32', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {/* Filtro de nível */}
              <div className="flex items-center" style={{ gap: '4px' }}>
                {opcoesNivel.map((opcao) => (
                  <button
                    key={opcao.chave}
                    type="button"
                    onClick={() => setFiltroNivel(opcao.chave)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{
                      background: filtroNivel === opcao.chave ? '#5b7cfa' : '#1e1e24',
                      color: filtroNivel === opcao.chave ? '#fff' : '#a8a8b3',
                      border: `1px solid ${filtroNivel === opcao.chave ? '#5b7cfa' : '#2a2a32'}`,
                    }}
                  >
                    {opcao.rotulo}
                  </button>
                ))}
              </div>

              {/* Separador */}
              <span style={{ width: '1px', height: '20px', background: '#2a2a32' }} />

              {/* Quantidade de linhas */}
              <div className="flex items-center" style={{ gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#6e6e7a', marginRight: '4px' }}>Linhas:</span>
                {opcoesLinhas.map((qtd) => (
                  <button
                    key={qtd}
                    type="button"
                    onClick={() => alterarLinhas(qtd)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
                    style={{
                      background: qtdLinhas === qtd ? '#5b7cfa' : '#1e1e24',
                      color: qtdLinhas === qtd ? '#fff' : '#a8a8b3',
                      border: `1px solid ${qtdLinhas === qtd ? '#5b7cfa' : '#2a2a32'}`,
                    }}
                  >
                    {qtd === 0 ? 'Todos' : qtd}
                  </button>
                ))}
              </div>

              {/* Contador */}
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#6e6e7a' }}>
                {carregandoLogs ? 'Carregando...' : `${logsFiltrados.length} de ${logs.length} linhas`}
              </span>
            </div>
          )}

          {/* Terminal */}
          <TerminalLog
            logs={logsFiltrados}
            carregando={carregandoLogs}
            nomeArquivo={servicoSelecionado ? `logs-${servicoSelecionado.nome}` : 'logs'}
          />
        </div>
      )}
    </div>
  );
}
