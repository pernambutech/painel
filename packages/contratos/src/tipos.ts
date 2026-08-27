// Contratos compartilhados entre componentes
// Este arquivo define os tipos base reutilizados pelos outros contratos

import type { UUID, Timestamp } from '@painel/tipos';
import type {
  TipoAmbiente,
  SistemaOperacional,
  StatusAgente,
  StatusServico,
  StatusComando,
  TipoServico,
} from '@painel/tipos';

// Re-exportar tipos do package base
export type {
  UUID,
  Timestamp,
  TipoAmbiente,
  SistemaOperacional,
  StatusAgente,
  StatusServico,
  StatusComando,
  TipoServico,
};

// ===========================================
// TIPOS DE COMANDO
// ===========================================

// Tipos de comandos que a API pode enviar ao agente
export type TipoComando =
  // Comandos de processo
  | 'INICIAR_SERVICO'
  | 'PARAR_SERVICO'
  | 'REINICIAR_SERVICO'
  | 'OBTER_STATUS_SERVICO'
  | 'OBTER_LOGS_SERVICO'
  // Comandos de Git
  | 'VERIFICAR_GIT'
  | 'EXECUTAR_GIT_PULL'
  // Comandos de sistema
  | 'OBTER_INFORMACOES_SISTEMA'
  | 'VERIFICAR_PORTAS'
  | 'VERIFICAR_DIRETORIO';

// ===========================================
// COMANDO ENVIADO PELA API
// ===========================================

// Estrutura de um comando enviado da API para o agente
export interface Comando {
  id: UUID;
  tipo: TipoComando;
  organizacaoId: UUID;
  ambienteId: UUID;
  projetoId?: UUID;
  servicoId?: UUID;
  dados?: Record<string, unknown>;
  criadoEm: Timestamp;
  expirarEm?: Timestamp;
}

// ===========================================
// RESPOSTA DO COMANDO
// ===========================================

// Resposta do agente para um comando
export interface RespostaComando {
  comandoId: UUID;
  status: StatusComando;
  dados?: Record<string, unknown>;
  erro?: string;
  executadoEm: Timestamp;
  duracaoMs?: number;
}

// ===========================================
// EVENTOS AGENTE → API
// ===========================================

// Eventos que o agente pode enviar para a API
export type TipoEventoAgente =
  | 'CONECTADO'
  | 'DESCONECTADO'
  | 'HEARTBEAT'
  | 'STATUS_SERVICO_ALTERADO'
  | 'ERRO_EXECUCAO'
  | 'LOG_SERVICO';

// Estrutura de um evento enviado pelo agente
export interface EventoAgente {
  tipo: TipoEventoAgente;
  agenteId: UUID;
  ambienteId: UUID;
  dados?: Record<string, unknown>;
  criadoEm: Timestamp;
}

// ===========================================
// CONTRATOS DE AUTENTICAÇÃO
// ===========================================

// Requisição de autenticação
export interface RequisicaoLogin {
  email: string;
  senha: string;
}

// Resposta de autenticação
export interface RespostaLogin {
  token: string;
  usuario: {
    id: UUID;
    nome: string;
    email: string;
  };
}

// ===========================================
// CONTRATOS DE ENTIDADES
// ===========================================

// Dados de um projeto
export interface Projeto {
  id: UUID;
  nome: string;
  descricao?: string;
  organizacaoId: UUID;
  ativo: boolean;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

// Dados de um serviço
export interface Servico {
  id: UUID;
  nome: string;
  tipo: TipoServico;
  diretorio: string;
  comando: string;
  porta?: number;
  projetoId: UUID;
  ambienteId: UUID;
  configuracaoPm2?: Record<string, unknown>;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

// Dados de um ambiente
export interface Ambiente {
  id: UUID;
  nome: string;
  tipo: TipoAmbiente;
  sistemaOperacional: SistemaOperacional;
  agenteId?: UUID;
  organizacaoId: UUID;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

// Dados de um agente
export interface Agente {
  id: UUID;
  nome: string;
  ambienteId: UUID;
  token: string;
  status: StatusAgente;
  ultimoHeartbeat?: Timestamp;
  versao?: string;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

// ===========================================
// CONTRATOS DE PROCESSO
// ===========================================

// Dados de um processo em execução
export interface Processo {
  id: UUID;
  servicoId: UUID;
  ambienteId: UUID;
  pid?: number;
  status: StatusServico;
  porta?: number;
  inicioEm: Timestamp;
  ultimoHeartbeat?: Timestamp;
  reinicios: number;
}

// ===========================================
// CONTRATOS DE EXECUÇÃO
// ===========================================

// Status de uma execução de comando
export interface Execucao {
  id: UUID;
  comandoId: UUID;
  agenteId: UUID;
  status: StatusComando;
  resultado?: Record<string, unknown>;
  erro?: string;
  inicioEm: Timestamp;
  fimEm?: Timestamp;
}
