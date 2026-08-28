// DTOs para autenticação
// Data Transfer Objects para cadastro e login

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

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
// RESPOSTA DE AUTENTICAÇÃO
// ===========================================

export interface RespostaAutenticacao {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
}
