// Tipos TypeScript compartilhados
// Este arquivo define os tipos básicos utilizados em toda a plataforma

// ===========================================
// TIPOS BÁSICOS
// ===========================================

// Identificador único universal
export type UUID = string;

// Timestamp ISO 8601
export type Timestamp = string;

// ===========================================
// STATUS GERAIS
// ===========================================

// Status genérico de entidades
export type StatusGeral = 'ativo' | 'inativo' | 'pendente';

// Status de conexão
export type StatusConexao = 'conectado' | 'desconectado' | 'reconectando';

// ===========================================
// STATUS DE SERVIÇO
// ===========================================

// Status possíveis de um serviço
export type StatusServico =
  'online' | 'offline' | 'iniciando' | 'parando' | 'reiniciando' | 'erro' | 'desconhecido';

// ===========================================
// STATUS DE AGENTE
// ===========================================

// Status possíveis de um agente
export type StatusAgente = 'online' | 'offline' | 'manutencao';

// ===========================================
// STATUS DE COMANDO
// ===========================================

// Status possíveis de um comando executado
export type StatusComando =
  'pendente' | 'enviada' | 'em_execucao' | 'sucesso' | 'falhou' | 'cancelada' | 'expirada';

// ===========================================
// TIPOS DE SERVIÇO
// ===========================================

// Tipos de serviço suportados
export type TipoServico =
  | 'frontend'
  | 'backend'
  | 'api'
  | 'worker'
  | 'bot'
  | 'crawler'
  | 'agendador'
  | 'websocket'
  | 'outro';

// ===========================================
// TIPOS DE AMBIENTE
// ===========================================

// Tipos de ambiente
export type TipoAmbiente = 'desenvolvimento' | 'homologacao' | 'producao' | 'local' | 'outro';

// ===========================================
// SISTEMA OPERACIONAL
// ===========================================

// Sistemas operacionais suportados
export type SistemaOperacional = 'windows' | 'linux' | 'macos' | 'outro';

// ===========================================
// PAGINAÇÃO
// ===========================================

// Configurações de paginação
export interface Paginacao {
  pagina: number;
  itensPorPagina: number;
  totalItens: number;
  totalPaginas: number;
}

// ===========================================
// RESPOSTA PADRÃO DA API
// ===========================================

// Resposta padrão para requisições da API
export interface RespostaApi<T> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  paginacao?: Paginacao;
}

// ===========================================
// ERRO DETALHADO
// ===========================================

// Erro detalhado para debugging
export interface ErroDetalhado {
  codigo: string;
  mensagem: string;
  detalhes?: string[];
}

// ===========================================
// ENTIDADES BASE
// ===========================================

// Entidade base com campos comuns
export interface EntidadeBase {
  id: UUID;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

// Entidade com soft delete
export interface EntidadeComSoftDelete extends EntidadeBase {
  deletadoEm: Timestamp | null;
}
