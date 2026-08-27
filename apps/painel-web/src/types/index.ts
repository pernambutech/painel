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
  agente?: Agente | null;
}

export interface CriarAmbienteDto {
  nome: string;
  tipo?: string;
  sistemaOperacional?: string;
}

// ===========================================
// AGENTE
// ===========================================

export interface Agente {
  id: string;
  nome: string;
  status: string; // online, offline, manutencao
  ultimoHeartbeat: string | null;
  versao: string | null;
  sistemaOperacional: string | null;
  cpuUso: number | null;
  memoriaUso: number | null;
  memoriaTotal: number | null;
  uptime: number | null;
  ambienteId: string;
  organizacaoId: string;
  ativo: boolean;
  criadoEm: string;
}

export interface TokenAgente {
  token: string;
  agenteId: string;
  ambienteId: string;
}

// ===========================================
// PROJETO
// ===========================================

export interface Projeto {
  id: string;
  nome: string;
  descricao: string | null;
  organizacaoId: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CriarProjetoDto {
  nome: string;
  descricao?: string;
}

export interface AtualizarProjetoDto {
  nome?: string;
  descricao?: string;
}

// ===========================================
// SERVIÇO
// ===========================================

export interface Servico {
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
  criadoEm: string;
  atualizadoEm: string;
  ambiente?: {
    id: string;
    nome: string;
    tipo: string;
  } | null;
}

export interface CriarServicoDto {
  nome: string;
  tipo?: string;
  diretorio?: string;
  comando?: string;
  porta?: number;
  ambienteId?: string;
}

export interface AtualizarServicoDto {
  nome?: string;
  tipo?: string;
  diretorio?: string;
  comando?: string;
  porta?: number | null;
  ambienteId?: string | null;
}

// ===========================================
// RESPOSTA DA API
// ===========================================

export interface RespostaApi<T> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
}
