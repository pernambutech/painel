// Tipos TypeScript compartilhados
// Este arquivo será expandido conforme as necessidades do projeto

// Tipos básicos
export type UUID = string;

export type Timestamp = Date;

// Status gerais
export type StatusGeral = 'ativo' | 'inativo' | 'pendente';

// Configurações de paginação
export interface Paginacao {
  pagina: number;
  itensPorPagina: number;
  totalItens: number;
  totalPaginas: number;
}

// Resposta padrão da API
export interface RespostaApi<T> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  paginacao?: Paginacao;
}
