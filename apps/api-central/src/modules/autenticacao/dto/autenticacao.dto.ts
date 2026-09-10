// DTOs para autenticação
// Data Transfer Objects para cadastro, login e perfil

import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

// ===========================================
// DTO DE CADASTRO
// ===========================================

export class CadastroDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsEmail({}, { message: 'Email deve ser válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;
}

// ===========================================
// DTO DE LOGIN
// ===========================================

export class LoginDto {
  @IsEmail({}, { message: 'Email deve ser válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  senha: string;
}

// ===========================================
// DTO DE ATUALIZAÇÃO DE PERFIL
// ===========================================

export class AtualizarPerfilDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nome?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sobrenome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cargo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  timezone?: string;
}

// ===========================================
// DTO DE ALTERAÇÃO DE SENHA
// ===========================================

export class AlterarSenhaDto {
  @IsString()
  @IsNotEmpty()
  senhaAtual: string;

  @IsString()
  @MinLength(6)
  novaSenha: string;
}

// ===========================================
// RESPOSTA DE AUTENTICAÇÃO
// ===========================================

export interface RespostaAutenticacao {
  token: string;
  usuario: {
    id: string;
    nome: string;
    sobrenome: string | null;
    email: string;
    avatar: string | null;
    cargo: string | null;
    timezone: string;
  };
}
