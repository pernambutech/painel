// Contratos compartilhados entre componentes
// Este arquivo exporta todos os contratos do projeto

// ===========================================
// RE-EXPORTAR TIPOS BASE
// ===========================================

export type {
  UUID,
  Timestamp,
  TipoAmbiente,
  SistemaOperacional,
  StatusAgente,
  StatusServico,
  StatusComando,
  TipoServico,
} from './tipos';

// ===========================================
// RE-EXPORTAR COMANDOS E RESPOSTAS
// ===========================================

export type {
  TipoComando,
  Comando,
  RespostaComando,
  TipoEventoAgente,
  EventoAgente,
} from './tipos';

// ===========================================
// RE-EXPORTAR AUTENTICAÇÃO
// ===========================================

export type { RequisicaoLogin, RespostaLogin } from './tipos';

// ===========================================
// RE-EXPORTAR ENTIDADES
// ===========================================

export type { Projeto, Servico, Ambiente, Agente, Processo, Execucao } from './tipos';

// ===========================================
// RE-EXPORTAR ADAPTADOR DE PROCESSOS
// ===========================================

export type {
  IAdaptadorProcessos,
  ConfiguracaoServico,
  ResultadoProcesso,
  StatusProcesso,
  OpcoesLogs,
  LogProcesso,
  ConfiguracaoPm2,
  EstadoPm2,
} from './adaptador-processos';

// ===========================================
// RE-EXPORTAR COMUNICAÇÃO
// ===========================================

export type {
  EventosApiParaAgente,
  EventosAgenteParaApi,
  HeartbeatAgente,
  LogTempoReal,
  StatusAlterado,
  ConfiguracaoWebSocket,
  EstadoConexao,
} from './comunicacao';
