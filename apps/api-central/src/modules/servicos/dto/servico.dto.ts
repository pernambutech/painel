// DTOs para serviços
// Data Transfer Objects para criação, atualização e consulta

import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// ===========================================
// DTO DE CRIAÇÃO
// ===========================================

export class CriarServicoDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsIn(['frontend', 'backend', 'api', 'worker', 'bot', 'custom'], {
    message: 'Tipo deve ser: frontend, backend, api, worker, bot ou custom',
  })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'Diretório deve ser uma string' })
  @MaxLength(500, { message: 'Diretório deve ter no máximo 500 caracteres' })
  diretorio?: string;

  @IsOptional()
  @IsString({ message: 'Comando deve ser uma string' })
  @MaxLength(500, { message: 'Comando deve ter no máximo 500 caracteres' })
  comando?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Porta deve ser um número' })
  @Min(1, { message: 'Porta deve estar entre 1 e 65535' })
  @Max(65535, { message: 'Porta deve estar entre 1 e 65535' })
  porta?: number;

  @IsOptional()
  @IsString({ message: 'AmbienteId deve ser um UUID válido' })
  ambienteId?: string;

  // Variáveis de ambiente do serviço (ex: { "NODE_ENV": "production", "DATABASE_URL": "..." })
  @IsOptional()
  variaveisAmbiente?: Record<string, string>;

  // Endpoint de health check (ex: "/api/health")
  @IsOptional()
  @IsString({ message: 'HealthCheckUrl deve ser uma string' })
  @MaxLength(500, { message: 'HealthCheckUrl deve ter no máximo 500 caracteres' })
  healthCheckUrl?: string;
}

// ===========================================
// DTO DE ATUALIZAÇÃO
// ===========================================

export class AtualizarServicoDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome não pode ser vazio' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsIn(['frontend', 'backend', 'api', 'worker', 'bot', 'custom'], {
    message: 'Tipo deve ser: frontend, backend, api, worker, bot ou custom',
  })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'Diretório deve ser uma string' })
  @MaxLength(500, { message: 'Diretório deve ter no máximo 500 caracteres' })
  diretorio?: string;

  @IsOptional()
  @IsString({ message: 'Comando deve ser uma string' })
  @MaxLength(500, { message: 'Comando deve ter no máximo 500 caracteres' })
  comando?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Porta deve ser um número' })
  @Min(1, { message: 'Porta deve estar entre 1 e 65535' })
  @Max(65535, { message: 'Porta deve estar entre 1 e 65535' })
  porta?: number | null;

  @IsOptional()
  @IsString({ message: 'AmbienteId deve ser um UUID válido' })
  ambienteId?: string | null;

  // Variáveis de ambiente do serviço
  @IsOptional()
  variaveisAmbiente?: Record<string, string> | null;

  // Endpoint de health check
  @IsOptional()
  @IsString({ message: 'HealthCheckUrl deve ser uma string' })
  @MaxLength(500, { message: 'HealthCheckUrl deve ter no máximo 500 caracteres' })
  healthCheckUrl?: string | null;
}

// ===========================================
// RESPOSTA DE SERVIÇO
// ===========================================

export interface RespostaServico {
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
  criadoEm: Date;
  atualizadoEm: Date;
  ambiente?: {
    id: string;
    nome: string;
    tipo: string;
  } | null;
}
