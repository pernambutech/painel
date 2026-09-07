// Página de logs
// Terminal estilizado como referência: fundo escuro, fonte mono, cores por nível

'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Terminal } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { servicosApi } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import type { LogServico, Servico } from '@/types';

export default function LogsPage() {
  const { organizacao } = useAuth();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState('');
  const [logs, setLogs] = useState<LogServico[]>([]);
  const [carregandoServicos, setCarregandoServicos] = useState(true);
  const [carregandoLogs, setCarregandoLogs] = useState(false);
  const [erro, setErro] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const servicoSelecionado = servicos.find((s) => s.id === servicoSelecionadoId);

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

  const carregarLogs = async (servico?: Servico) => {
    const alvo = servico || servicoSelecionado;
    if (!organizacao || !alvo) return;

    try {
      setCarregandoLogs(true);
      setErro('');
      const dados = await servicosApi.obterLogs(organizacao.id, alvo.projetoId, alvo.id, {
        tipo: 'todos',
        linhas: 100,
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
  };

  const selecionarServico = (servicoId: string) => {
    const servico = servicos.find((item) => item.id === servicoId);
    setServicoSelecionadoId(servicoId);
    setLogs([]);
    setErro('');
    if (servico) carregarLogs(servico);
  };

  // Auto-scroll para baixo quando logs chegam
  useEffect(() => {
    if (scrollRef.current && logs.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Formatar timestamp: [HH:MM:SS]
  const formatarTimestamp = (timestamp: string | null | undefined) => {
    if (!timestamp) return '[--:--:--]';
    try {
      const data = new Date(timestamp);
      if (isNaN(data.getTime())) return '[--:--:--]';
      return `[${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]`;
    } catch {
      return '[--:--:--]';
    }
  };

  // Cor da linha por nível
  const corNivel = (nivel: string) => {
    switch (nivel) {
      case 'error': return '#f87171';
      case 'warn': return '#fbbf24';
      case 'debug': return '#60a5fa';
      default: return '#3dd68c';
    }
  };

  const labelNivel = (nivel: string) => {
    switch (nivel) {
      case 'error': return 'ERROR';
      case 'warn': return 'WARN';
      case 'debug': return 'DEBUG';
      default: return 'INFO';
    }
  };

  if (carregandoServicos) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Spinner tamanho="grande" />
        <p className="text-sm" style={{ color: '#6e6e7a' }}>Carregando serviços...</p>
      </div>
    );
  }

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

      {/* Seletor de serviço */}
      {servicos.length === 0 ? (
        <div className="rounded-xl border border-[#2a2a32] bg-[#16161a] flex min-h-64 flex-col items-center justify-center px-5 text-center">
          <Terminal className="mb-3 h-9 w-9" style={{ color: '#3a3a44' }} />
          <p className="text-sm" style={{ color: '#a8a8b3' }}>Nenhum serviço cadastrado.</p>
          <p className="mt-1 text-xs" style={{ color: '#6e6e7a' }}>
            Cadastre um serviço para visualizar seus logs.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2a2a32] bg-[#16161a] overflow-hidden">
          {/* Barra de seleção */}
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #2a2a32', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <span style={{ fontSize: '12px', color: '#6e6e7a' }}>
                {carregandoLogs ? 'Carregando...' : `${logs.length} linhas`}
              </span>
            )}
          </div>

          {/* Terminal de logs */}
          <div
            ref={scrollRef}
            style={{
              background: '#0a0a0e',
              padding: '20px',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: '13px',
              color: '#b0b0c0',
              overflow: 'auto',
              maxHeight: '400px',
              minHeight: '200px',
            }}
          >
            {!servicoSelecionado ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', textAlign: 'center' }}>
                <Terminal className="mb-3 h-9 w-9" style={{ color: '#3a3a44' }} />
                <p style={{ color: '#6e6e7a' }}>Selecione um serviço para visualizar os logs.</p>
              </div>
            ) : carregandoLogs ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                <Spinner tamanho="pequeno" />
              </div>
            ) : logs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', textAlign: 'center' }}>
                <p style={{ color: '#6e6e7a' }}>Nenhum log encontrado.</p>
                <p style={{ color: '#6e6e7a', fontSize: '12px', marginTop: '4px' }}>
                  Inicie o serviço para gerar novas entradas.
                </p>
              </div>
            ) : (
              logs.map((log, indice) => (
                <div key={`${log.timestamp}-${indice}`} style={{ lineHeight: '1.8' }}>
                  <span style={{ color: '#6e6e7a' }}>{formatarTimestamp(log.timestamp)}</span>{' '}
                  <span style={{ color: corNivel(log.nivel), fontWeight: 500 }}>{labelNivel(log.nivel)}</span>{' '}
                  <span style={{ color: '#b0b0c0' }}>{log.mensagem}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
