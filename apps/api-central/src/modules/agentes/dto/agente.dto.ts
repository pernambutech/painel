// DTOs para agentes
// Data Transfer Objects para registro, autenticação e consulta

// ===========================================
// DTO DE REGISTRO
// ===========================================

// Dados enviados pelo agente ao se registrar
export interface RegistrarAgenteDto {
  token: string;
  nome: string;
  sistemaOperacional?: string;
  versao?: string;
}

// ===========================================
// DTO DE ATUALIZAÇÃO
// ===========================================

// Dados para atualizar um agente
export interface AtualizarAgenteDto {
  nome?: string;
  status?: string;
  diretoriosAutorizados?: string[]; // Lista de paths permitidos
}

// ===========================================
// DTO DE HEARTBEAT
// ===========================================

// Dados enviados no heartbeat do agente
export interface HeartbeatAgenteDto {
  agenteId: string;
  sistema: {
    cpuUso: number;
    memoriaUso: number;
    memoriaTotal: number;
    uptime: number;
  };
  processos: {
    total: number;
    online: number;
    offline: number;
    erro: number;
  };
}

// ===========================================
// RESPOSTA DE AGENTE
// ===========================================

// Resposta retornada ao criar ou consultar agente
export interface RespostaAgente {
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
  ambienteId: string;
  organizacaoId: string;
  ativo: boolean;
  criadoEm: Date;
}

// ===========================================
// RESPOSTA DE TOKEN
// ===========================================

// Token gerado para o agente
export interface RespostaTokenAgente {
  token: string;
  agenteId: string;
  ambienteId: string;
}
