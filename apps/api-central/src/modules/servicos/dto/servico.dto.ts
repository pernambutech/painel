// DTOs para serviços
// Data Transfer Objects para criação, atualização e consulta

// ===========================================
// DTO DE CRIAÇÃO
// ===========================================

// Dados necessários para criar um serviço
export interface CriarServicoDto {
  nome: string;
  tipo?: string; // frontend, backend, api, worker, bot, custom
  diretorio?: string;
  comando?: string;
  porta?: number;
  ambienteId?: string;
}

// ===========================================
// DTO DE ATUALIZAÇÃO
// ===========================================

// Dados para atualizar um serviço
export interface AtualizarServicoDto {
  nome?: string;
  tipo?: string;
  diretorio?: string;
  comando?: string;
  porta?: number | null;
  ambienteId?: string | null;
}

// ===========================================
// RESPOSTA DE SERVIÇO
// ===========================================

// Resposta retornada ao criar ou consultar serviço
export interface RespostaServico {
  id: string;
  nome: string;
  tipo: string;
  diretorio: string | null;
  comando: string | null;
  porta: number | null;
  projetoId: string;
  ambienteId: string | null;
  organizacaoId: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
  // Dados do ambiente associado (quando incluído)
  ambiente?: {
    id: string;
    nome: string;
    tipo: string;
  } | null;
}
