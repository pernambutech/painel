// DTOs para organizações
// Data Transfer Objects para criação e consulta

import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// ===========================================
// DTO DE CRIAÇÃO
// ===========================================

export class CriarOrganizacaoDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;
}

export class AtualizarOrganizacaoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome?: string;
}

// ===========================================
// RESPOSTA DE ORGANIZAÇÃO
// ===========================================

export interface RespostaOrganizacao {
  id: string;
  nome: string;
  slug: string;
  papel: string;
  criadoEm: Date;
}

// ===========================================
// CONTEXTO DA ORGANIZAÇÃO
// ===========================================

export interface ContextoOrganizacao {
  organizacaoId: string;
  nome: string;
  slug: string;
  papel: string;
}
