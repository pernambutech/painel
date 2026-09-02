// Hook para conexão WebSocket com a API central
// Recebe atualizações em tempo real de agentes e processos

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const URL_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

interface UseSocketOpcoes {
  token?: string;
  onStatusAgente?: (dados: { agenteId: string; ambienteId: string; status: string }) => void;
  onDashboardAtualizado?: () => void;
  onStatusProcesso?: (dados: Record<string, unknown>) => void;
}

export function useSocket(opcoes: UseSocketOpcoes) {
  const { token, onStatusAgente, onDashboardAtualizado, onStatusProcesso } = opcoes;
  const [conectado, setConectado] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const callbacksRef = useRef({ onStatusAgente, onDashboardAtualizado, onStatusProcesso });
  callbacksRef.current = { onStatusAgente, onDashboardAtualizado, onStatusProcesso };

  useEffect(() => {
    // Ler token do localStorage se não fornecido
    const tokenFinal = token || (typeof window !== 'undefined'
      ? localStorage.getItem('token_painel') || undefined
      : undefined);

    if (!tokenFinal) return;

    const socket = io(`${URL_API}/painel`, {
      auth: { token: tokenFinal },
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionAttempts: 0,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConectado(true);
    });

    socket.on('disconnect', () => {
      setConectado(false);
    });

    socket.on('status_agente', (dados) => {
      callbacksRef.current.onStatusAgente?.(dados);
    });

    socket.on('dashboard_atualizado', () => {
      callbacksRef.current.onDashboardAtualizado?.();
    });

    socket.on('status_processo', (dados) => {
      callbacksRef.current.onStatusProcesso?.(dados);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConectado(false);
    };
  }, []);

  const emitir = useCallback((evento: string, dados?: unknown) => {
    socketRef.current?.emit(evento, dados);
  }, []);

  return { conectado, emitir };
}
