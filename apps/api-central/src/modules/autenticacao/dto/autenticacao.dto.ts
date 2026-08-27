// DTOs para autenticação
// Data Transfer Objects para cadastro e login

// ===========================================
// DTO DE CADASTRO
// ===========================================

// Dados necessários para cadastrar um novo usuário
export interface CadastroDto {
  nome: string;
  email: string;
  senha: string;
}

// ===========================================
// DTO DE LOGIN
// ===========================================

// Dados necessários para fazer login
export interface LoginDto {
  email: string;
  senha: string;
}

// ===========================================
// RESPOSTA DE AUTENTICAÇÃO
// ===========================================

// Resposta retornada após login ou cadastro bem-sucedido
export interface RespostaAutenticacao {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
}
