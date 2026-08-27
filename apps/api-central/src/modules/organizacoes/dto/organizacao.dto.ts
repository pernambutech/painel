// DTOs para organizações
// Data Transfer Objects para criação e consulta

// ===========================================
// DTO DE CRIAÇÃO
// ===========================================

// Dados necessários para criar uma organização
export interface CriarOrganizacaoDto {
  nome: string;
}

// ===========================================
// RESPOSTA DE ORGANIZAÇÃO
// ===========================================

// Resposta retornada ao criar ou consultar organização
export interface RespostaOrganizacao {
  id: string;
  nome: string;
  slug: string;
  papel: string; // proprietario, admin, membro
  criadoEm: Date;
}

// ===========================================
// CONTEXTO DA ORGANIZAÇÃO
// ===========================================

// Contexto da organização atual do usuário
export interface ContextoOrganizacao {
  organizacaoId: string;
  nome: string;
  slug: string;
  papel: string;
}
