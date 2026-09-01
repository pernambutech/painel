// DTOs para projetos
// Data Transfer Objects para criação, atualização e consulta

import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// ===========================================
// DTO DE CRIAÇÃO
// ===========================================

export class CriarProjetoDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  descricao?: string;
}

// ===========================================
// DTO DE ATUALIZAÇÃO
// ===========================================

export class AtualizarProjetoDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome não pode ser vazio' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  descricao?: string;
}

// ===========================================
// RESPOSTA DE PROJETO
// ===========================================

export interface RespostaProjeto {
  id: string;
  nome: string;
  descricao: string | null;
  organizacaoId: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Contagem de serviços da listagem
export interface RespostaListagemProjeto {
  id: string;
  nome: string;
  descricao: string | null;
  organizacaoId: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
  totalServicos: number;
}
