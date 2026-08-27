// DTOs para ambientes
// Data Transfer Objects para criação e consulta

// ===========================================
// DTO DE CRIAÇÃO
// ===========================================

// Dados necessários para criar um ambiente
export interface CriarAmbienteDto {
  nome: string;
  tipo?: string; // local, desenvolvimento, homologacao, producao
  sistemaOperacional?: string; // windows, linux, macos
}

// ===========================================
// DTO DE ATUALIZAÇÃO
// ===========================================

// Dados para atualizar um ambiente
export interface AtualizarAmbienteDto {
  nome?: string;
  tipo?: string;
  sistemaOperacional?: string;
}

// ===========================================
// DADOS DO AGENTE NO AMBIENTE
// ===========================================

// Informações do agente associado ao ambiente
export interface AgenteNoAmbiente {
  id: string;
  nome: string;
  status: string;
  ultimoHeartbeat: Date | null;
  versao: string | null;
  sistemaOperacional: string | null;
  cpuUso: number | null;
  memoriaUso: number | null;
  memoriaTotal: number | null;
  uptime: number | null;
}

// ===========================================
// RESPOSTA DE AMBIENTE
// ===========================================

// Resposta retornada ao criar ou consultar ambiente
export interface RespostaAmbiente {
  id: string;
  nome: string;
  tipo: string;
  sistemaOperacional: string;
  organizacaoId: string;
  ativo: boolean;
  criadoEm: Date;
  agente?: AgenteNoAmbiente | null;
}
