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
  totalServicos?: number;
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
  variaveisAmbiente: Record<string, string> | null;
  healthCheckUrl: string | null;
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
  variaveisAmbiente?: Record<string, string>;
  healthCheckUrl?: string;
}

export interface AtualizarServicoDto {
  nome?: string;
  tipo?: string;
  diretorio?: string;
  comando?: string;
  porta?: number | null;
  ambienteId?: string | null;
}

export interface LogServico {
  timestamp: string;
  nivel: 'info' | 'warn' | 'error' | 'debug';
  mensagem: string;
  fonte?: 'stdout' | 'stderr';
}

// ===========================================
// EXECUÇÃO / HISTÓRICO
// ===========================================

export interface Execucao {
  id: string;
  organizacaoId: string;
  projetoId: string | null;
  servicoId: string;
  ambienteId: string | null;
  acao: string; // iniciar, parar, reiniciar
  status: string; // pendente, sucesso, falhou
  resultado?: Record<string, unknown> | null;
  erro?: string | null;
  usuarioId: string;
  criadoEm: string;
  atualizadoEm: string;
  usuario?: { id: string; nome: string; email: string };
  servico?: { id: string; nome: string; tipo: string };
  projeto?: { id: string; nome: string } | null;
  ambiente?: { id: string; nome: string } | null;
}

// ===========================================
// STATUS PM2
// ===========================================

export interface StatusPm2 {
  status: 'online' | 'stopped' | 'errored' | 'iniciando' | 'parando' | 'reiniciando' | 'desconhecido';
  pid: number | null;
  uptimeMs: number | null;
  reinicios: number | null;
  usoCpu: number | null;
  usoMemoria: number | null;
}

// ===========================================
// GIT
// ===========================================

export interface GitStatus {
  branch: string;
  branchInfo?: string;
  arquivos: GitArquivo[];
  commitAtual?: string;
  remote?: string;
}

export interface GitArquivo {
  arquivo: string;
  status: string; // M, A, D, R, C, ?
  index?: string;
  worktree?: string;
}

export interface GitBranchResponse {
  branches: string[];
  atual: string;
}

export interface GitLogEntry {
  hash: string;
  hashCurto: string;
  mensagem: string;
  autor: string;
  data: string;
  branches: string[];
}

// ===========================================
// LOG
// ===========================================

export interface Log {
  timestamp: string;
  nivel: 'info' | 'warn' | 'error' | 'debug';
  mensagem: string;
  fonte?: string;
}

// ===========================================
// RESPOSTA DA API
// ===========================================

export interface RespostaApi<T> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
}
