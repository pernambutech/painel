// Terminal de logs compartilhado
// Usado tanto na página /logs quanto no modal de logs dos projetos

'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { Spinner } from './Spinner';
import type { LogServico } from '@/types';

// ===========================================
// PROPS
// ===========================================

interface TerminalLogProps {
  logs: LogServico[];
  carregando: boolean;
  maxHeight?: string;
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

export function TerminalLog({ logs, carregando, maxHeight = '400px' }: TerminalLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para baixo quando logs chegam
  useEffect(() => {
    if (scrollRef.current && logs.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
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
        borderRadius: '0 0 12px 12px',
      }}
    >
      {carregando ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
          <Spinner tamanho="pequeno" />
        </div>
      ) : logs.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', textAlign: 'center' }}>
          <Terminal className="mb-3 h-9 w-9" style={{ color: '#3a3a44' }} />
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
  );
}
