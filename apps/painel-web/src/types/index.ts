// Tipos compartilhados do frontend

// ===========================================
// USUÁRIO
// ===========================================

export interface Usuario {
  id: string;
  nome: string;
  email: string;
}

// ===========================================
// AUTENTICAÇÃO
// ===========================================

export interface RespostaAutenticacao {
  token: string;
  usuario: Usuario;
}

export interface CadastroDto {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginDto {
  email: string;
  senha: string;
}

// ===========================================
// ORGANIZAÇÃO
// ===========================================

export interface Organizacao {
  id: string;
  nome: string;
  slug: string;
  papel: string;
  criadoEm: string;
}

// ===========================================
// AMBIENTE
// ===========================================

export interface Ambiente {
  id: string;
  nome: string;
  tipo: string;
  sistemaOperacional: string;
  organizacaoId: string;
  ativo: boolean;
  criadoEm: string;
}

export interface CriarAmbienteDto {
  nome: string;
  tipo?: string;
  sistemaOperacional?: string;
}

// ===========================================
// RESPOSTA DA API
// ===========================================

export interface RespostaApi<T> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
}
