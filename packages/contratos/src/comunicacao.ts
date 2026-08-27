// Contratos de comunicação WebSocket
// Este arquivo define os eventos e mensagens trocados via WebSocket

import type { UUID, Timestamp } from './tipos';
import type { Comando, RespostaComando, EventoAgente } from './tipos';

// ===========================================
// EVENTOS DA API → AGENTE
// ===========================================

// Eventos que a API pode enviar para o agente
export interface EventosApiParaAgente {
  // Comando para executar
  comando: (comando: Comando) => void;

  // Solicitação de heartbeat
  heartbeat_request: () => void;

  // Configuração atualizada
  configuracao_atualizada: (config: Record<string, unknown>) => void;

  // Desconexão solicitada
  desconectar: (motivo?: string) => void;
}

// ===========================================
// EVENTOS DO AGENTE → API
// ===========================================

// Eventos que o agente pode enviar para a API
export interface EventosAgenteParaApi {
  // Resposta a um comando
  resposta_comando: (resposta: RespostaComando) => void;

  // Heartbeat do agente
  heartbeat: (dados: HeartbeatAgente) => void;

  // Evento genérico do agente
  evento: (evento: EventoAgente) => void;

  // Log em tempo real
  log_servico: (log: LogTempoReal) => void;

  // Status alterado
  status_alterado: (dados: StatusAlterado) => void;
}

// ===========================================
// DADOS DO HEARTBEAT
// ===========================================

// Dados enviados no heartbeat do agente
export interface HeartbeatAgente {
  agenteId: UUID;
  timestamp: Timestamp;
  sistema: {
    cpuUso: number;
    memoriaUso: number;
    memoriaTotal: number;
    discoUso?: number;
    uptime: number;
  };
  processos: {
    total: number;
    online: number;
    offline: number;
  };
}

// ===========================================
// LOG EM TEMPO REAL
// ===========================================

// Log enviado em tempo real do serviço
export interface LogTempoReal {
  servicoId: UUID;
  processoId: UUID;
  timestamp: Timestamp;
  nivel: 'info' | 'warn' | 'error' | 'debug';
  mensagem: string;
  fonte: 'stdout' | 'stderr';
}

// ===========================================
// STATUS ALTERADO
// ===========================================

// Dados quando um status é alterado
export interface StatusAlterado {
  servicoId: UUID;
  processoId: UUID;
  statusAnterior: string;
  statusNovo: Timestamp;
  pid?: number;
  erro?: string;
}

// ===========================================
// CONFIGURAÇÃO DA CONEXÃO
// ===========================================

// Configurações da conexão WebSocket
export interface ConfiguracaoWebSocket {
  // URL do servidor
  url: string;

  // Token de autenticação
  token: string;

  // Intervalo de heartbeat (ms)
  intervaloHeartbeat?: number;

  // Timeout de reconexão (ms)
  timeoutReconexao?: number;

  // Máximo de tentativas de reconexão
  maxTentativas?: number;
}

// ===========================================
// ESTADO DA CONEXÃO
// ===========================================

// Estado atual da conexão WebSocket
export interface EstadoConexao {
  conectado: boolean;
  reconectando: boolean;
  ultimaConexao?: Timestamp;
  ultimaDesconexao?: Timestamp;
  tentativasReconexao: number;
  latenciaMs?: number;
}
