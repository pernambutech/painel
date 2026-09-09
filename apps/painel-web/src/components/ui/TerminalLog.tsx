// Terminal de logs compartilhado
// Usado tanto na página /logs quanto no modal de logs dos projetos

'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal, Download } from 'lucide-react';
import { Spinner } from './Spinner';
import type { LogServico } from '@/types';

// ===========================================
// PROPS
// ===========================================

interface TerminalLogProps {
  logs: LogServico[];
  carregando: boolean;
  maxHeight?: string;
  nomeArquivo?: string;
}

// ===========================================
// FORMATAÇÃO
// ===========================================

function formatarTimestamp(timestamp: string | null | undefined) {
  if (!timestamp) return '[--:--:--]';
  try {
    const data = new Date(timestamp);
    if (isNaN(data.getTime())) return '[--:--:--]';
    return `[${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]`;
  } catch {
    return '[--:--:--]';
  }
}

function formatarData(timestamp: string | null | undefined) {
  if (!timestamp) return '';
  try {
    const data = new Date(timestamp);
    if (isNaN(data.getTime())) return '';
    return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '';
  }
}

function corNivel(nivel: string) {
  switch (nivel) {
    case 'error': return '#f87171';
    case 'warn': return '#fbbf24';
    case 'debug': return '#60a5fa';
    default: return '#3dd68c';
  }
}

function labelNivel(nivel: string) {
  switch (nivel) {
    case 'error': return 'ERROR';
    case 'warn': return 'WARN';
    case 'debug': return 'DEBUG';
    default: return 'INFO';
  }
}

// ===========================================
// COMPONENTE
// ===========================================

export function TerminalLog({ logs, carregando, maxHeight = '400px', nomeArquivo = 'logs' }: TerminalLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filtroData, setFiltroData] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [exportando, setExportando] = useState(false);

  // Auto-scroll para baixo quando logs chegam
  useEffect(() => {
    if (scrollRef.current && logs.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Filtrar logs por data
  const logsFiltradosData = filtroData
    ? logs.filter((log) => {
        if (!log.timestamp) return false;
        const dataLog = new Date(log.timestamp);
        if (isNaN(dataLog.getTime())) return false;

        if (dataInicio) {
          const inicio = new Date(dataInicio);
          if (!isNaN(inicio.getTime()) && dataLog < inicio) return false;
        }

        if (dataFim) {
          const fim = new Date(dataFim);
          if (!isNaN(fim.getTime())) {
            // Incluir o fim do dia
            fim.setHours(23, 59, 59, 999);
            if (dataLog > fim) return false;
          }
        }

        return true;
      })
    : logs;

  // Exportar logs como .txt
  const exportarLogs = () => {
    try {
      setExportando(true);

      const conteudo = logsFiltradosData
        .map((log) => {
          const data = formatarData(log.timestamp);
          const nivel = labelNivel(log.nivel);
          return `[${data}] [${nivel}] ${log.mensagem}`;
        })
        .join('\n');

      const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Nome do arquivo com data atual
      const agora = new Date();
      const dataFormatada = agora.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
      link.download = `${nomeArquivo}-${dataFormatada}.txt`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Ignorar erro de exportação
    } finally {
      setExportando(false);
    }
  };

  return (
    <div>
      {/* Barra de ferramentas */}
      {logs.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            background: '#0a0a0e',
            borderBottom: '1px solid #1e1e24',
            borderRadius: '12px 12px 0 0',
          }}
        >
          {/* Toggle filtro de data */}
          <button
            onClick={() => setFiltroData(!filtroData)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: filtroData ? '#5b7cfa' : '#1e1e24',
              color: filtroData ? '#fff' : '#a8a8b3',
              border: `1px solid ${filtroData ? '#5b7cfa' : '#2a2a32'}`,
            }}
          >
            <Terminal className="h-3 w-3" />
            Filtro data
          </button>

          {/* Campos de data */}
          {filtroData && (
            <>
              <input
                type="datetime-local"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="rounded-md border border-[#2a2a32] bg-[#1e1e24] px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-[#5b7cfa]"
                placeholder="De..."
              />
              <span style={{ color: '#6e6e7a', fontSize: '11px' }}>até</span>
              <input
                type="datetime-local"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="rounded-md border border-[#2a2a32] bg-[#1e1e24] px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-[#5b7cfa]"
                placeholder="Até..."
              />
              {(dataInicio || dataFim) && (
                <button
                  onClick={() => { setDataInicio(''); setDataFim(''); }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Limpar
                </button>
              )}
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#6e6e7a' }}>
                {logsFiltradosData.length} de {logs.length} linhas
              </span>
            </>
          )}

          {/* Botão de exportar */}
          {!filtroData && (
            <button
              onClick={exportarLogs}
              disabled={exportando}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ml-auto"
              style={{
                background: '#1e1e24',
                color: '#a8a8b3',
                border: '1px solid #2a2a32',
                cursor: exportando ? 'not-allowed' : 'pointer',
                opacity: exportando ? 0.5 : 1,
              }}
            >
              <Download className={`h-3 w-3 ${exportando ? 'animate-bounce' : ''}`} />
              Exportar .txt
            </button>
          )}

          {filtroData && (
            <button
              onClick={exportarLogs}
              disabled={exportando || logsFiltradosData.length === 0}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: '#1e1e24',
                color: '#a8a8b3',
                border: '1px solid #2a2a32',
                cursor: exportando || logsFiltradosData.length === 0 ? 'not-allowed' : 'pointer',
                opacity: exportando || logsFiltradosData.length === 0 ? 0.5 : 1,
              }}
            >
              <Download className={`h-3 w-3 ${exportando ? 'animate-bounce' : ''}`} />
              Exportar filtrado
            </button>
          )}
        </div>
      )}

      {/* Terminal */}
      <div
        ref={scrollRef}
        style={{
          background: '#0a0a0e',
          padding: '20px',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: '13px',
          color: '#b0b0c0',
          overflow: 'auto',
          maxHeight,
          minHeight: '200px',
          borderRadius: logs.length > 0 ? '0 0 12px 12px' : '12px',
        }}
      >
        {carregando ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <Spinner tamanho="pequeno" />
          </div>
        ) : logsFiltradosData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', textAlign: 'center' }}>
            <Terminal className="mb-3 h-9 w-9" style={{ color: '#3a3a44' }} />
            <p style={{ color: '#6e6e7a' }}>Nenhum log encontrado.</p>
            <p style={{ color: '#6e6e7a', fontSize: '12px', marginTop: '4px' }}>
              {filtroData ? 'Nenhum log no período selecionado.' : 'Inicie o serviço para gerar novas entradas.'}
            </p>
          </div>
        ) : (
          logsFiltradosData.map((log, indice) => (
            <div key={`${log.timestamp}-${indice}`} style={{ lineHeight: '1.8' }}>
              <span style={{ color: '#6e6e7a' }}>{formatarTimestamp(log.timestamp)}</span>{' '}
              <span style={{ color: corNivel(log.nivel), fontWeight: 500 }}>{labelNivel(log.nivel)}</span>{' '}
              <span style={{ color: '#b0b0c0' }}>{log.mensagem}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
