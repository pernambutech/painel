// DTOs para projetos
// Data Transfer Objects para criação, atualização e consulta

// ===========================================
// DTO DE CRIAÇÃO
// ===========================================

// Dados necessários para criar um projeto
export interface CriarProjetoDto {
  nome: string;
  descricao?: string;
}

// ===========================================
// DTO DE ATUALIZAÇÃO
// ===========================================

// Dados para atualizar um projeto
export interface AtualizarProjetoDto {
  nome?: string;
  descricao?: string;
}

// ===========================================
// RESPOSTA DE PROJETO
// ===========================================

// Resposta retornada ao criar ou consultar projeto
export interface RespostaProjeto {
  id: string;
  nome: string;
  descricao: string | null;
  organizacaoId: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}