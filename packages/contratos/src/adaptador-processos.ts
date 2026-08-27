// Contratos do adaptador de gerenciamento de processos
// Este arquivo define a interface para o adaptador PM2 e futuros adaptadores

import type { UUID, Timestamp, StatusServico } from './tipos';

// ===========================================
// INTERFACE DO ADAPTADOR DE PROCESSOS
// ===========================================

// Interface que todo adaptador de processos deve implementar
export interface IAdaptadorProcessos {
  // Operações básicas de processo
  iniciar(configuracao: ConfiguracaoServico): Promise<ResultadoProcesso>;
  parar(id: UUID): Promise<ResultadoProcesso>;
  reiniciar(id: UUID): Promise<ResultadoProcesso>;
  obterStatus(id: UUID): Promise<StatusProcesso>;
  obterLogs(id: UUID, opcoes?: OpcoesLogs): Promise<LogProcesso[]>;

  // Operações em lote
  obterTodosStatus(): Promise<StatusProcesso[]>;

  // Ciclo de vida
  inicializar(): Promise<void>;
  finalizar(): Promise<void>;
}

// ===========================================
// CONFIGURAÇÃO DO SERVIÇO
// ===========================================

// Configuração necessária para iniciar um serviço
export interface ConfiguracaoServico {
  id: UUID;
  nome: string;
  diretorio: string;
  comando: string;
  argumentos?: string[];
  variaveisAmbiente?: Record<string, string>;
  porta?: number;
  nomePm2?: string;
  maxReinicios?: number;
  restartDelay?: number;
}

// ===========================================
// RESULTADO DE OPERAÇÃO
// ===========================================

// Resultado de uma operação de processo
export interface ResultadoProcesso {
  sucesso: boolean;
  processoId?: UUID;
  pid?: number;
  erro?: string;
  dados?: Record<string, unknown>;
}

// ===========================================
// STATUS DO PROCESSO
// ===========================================

// Status detalhado de um processo
export interface StatusProcesso {
  processoId: UUID;
  pid?: number;
  nome: string;
  status: StatusServico;
  porta?: number;
  inicioEm?: Timestamp;
  uptimeMs?: number;
  reinicios: number;
  usoCpu?: number;
  usoMemoria?: number;
  memoriaMb?: number;
}

// ===========================================
// LOGS DO PROCESSO
// ===========================================

// Opções para consulta de logs
export interface OpcoesLogs {
  linhas?: number;
  tipo?: 'stdout' | 'stderr' | 'todos';
  desde?: Timestamp;
}

// Entrada de log do processo
export interface LogProcesso {
  timestamp: Timestamp;
  nivel: 'info' | 'warn' | 'error' | 'debug';
  mensagem: string;
  fonte?: 'stdout' | 'stderr';
}

// ===========================================
// CONFIGURAÇÃO DO ADAPTADOR PM2
// ===========================================

// Configurações específicas do adaptador PM2
export interface ConfiguracaoPm2 {
  // Caminho do arquivo de dump para persistência
  dumpFile?: string;

  // Configurações de loop
  maxMemoryRestart?: string;

  // Configurações de logs
  logFile?: string;
  errorFile?: string;
  outFile?: string;

  // Configurações de namespace
  namespace?: string;
}

// ===========================================
// ESTADO DO PM2
// ===========================================

// Estado atual do PM2
export interface EstadoPm2 {
  processos: StatusProcesso[];
  versao: string;
  uptime: number;
  pid: number;
}
