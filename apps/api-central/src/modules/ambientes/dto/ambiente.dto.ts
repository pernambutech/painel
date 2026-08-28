// DTOs para ambientes
// Data Transfer Objects para criação e consulta

import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// ===========================================
// DTO DE CRIAÇÃO
// ===========================================

export class CriarAmbienteDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsIn(['local', 'desenvolvimento', 'homologacao', 'producao'], {
    message: 'Tipo deve ser: local, desenvolvimento, homologacao ou producao',
  })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'Sistema operacional deve ser uma string' })
  @IsIn(['windows', 'linux', 'macos'], {
    message: 'Sistema operacional deve ser: windows, linux ou macos',
  })
  sistemaOperacional?: string;
}

// ===========================================
// DTO DE ATUALIZAÇÃO
// ===========================================

export class AtualizarAmbienteDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome não pode ser vazio' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'Tipo deve ser uma string' })
  @IsIn(['local', 'desenvolvimento', 'homologacao', 'producao'], {
    message: 'Tipo deve ser: local, desenvolvimento, homologacao ou producao',
  })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'Sistema operacional deve ser uma string' })
  @IsIn(['windows', 'linux', 'macos'], {
    message: 'Sistema operacional deve ser: windows, linux ou macos',
  })
  sistemaOperacional?: string;
}

// ===========================================
// DADOS DO AGENTE NO AMBIENTE
// ===========================================

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
