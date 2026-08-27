// Cliente HTTP para comunicação com a API Central

import axios from 'axios';

// ===========================================
// INSTÂNCIA DO AXIOS
// ===========================================

const api = axios.create({
  // URL base da API Central
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  // Timeout de 10 segundos
  timeout: 10000,
  // Headers padrão
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===========================================
// INTERCEPTOR DE REQUISIÇÃO
// ===========================================

// Adiciona o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    // Buscar token do localStorage (só no cliente)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token_painel');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (erro) => {
    return Promise.reject(erro);
  },
);

// ===========================================
// INTERCEPTOR DE RESPOSTA
// ===========================================

// Trata erros de autenticação automaticamente
api.interceptors.response.use(
  (resposta) => {
    return resposta;
  },
  (erro) => {
    // Se receber 401 (não autorizado), limpar token e redirecionar
    if (erro.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token_painel');
        localStorage.removeItem('usuario_painel');
        // Redirecionar para login
        window.location.href = '/login';
      }
    }
    return Promise.reject(erro);
  },
);

// ===========================================
// SERVIÇOS DE AUTENTICAÇÃO
// ===========================================

export const autenticacaoApi = {
  // Cadastrar novo usuário
  cadastrar: async (dados: { nome: string; email: string; senha: string }) => {
    const resposta = await api.post('/auth/cadastro', dados);
    return resposta.data;
  },

  // Fazer login
  login: async (dados: { email: string; senha: string }) => {
    const resposta = await api.post('/auth/login', dados);
    return resposta.data;
  },

  // Obter perfil do usuário autenticado
  obterPerfil: async () => {
    const resposta = await api.get('/auth/perfil');
    return resposta.data;
  },
};

// ===========================================
// SERVIÇOS DE ORGANIZAÇÕES
// ===========================================

export const organizacoesApi = {
  // Listar organizações do usuário
  listar: async () => {
    const resposta = await api.get('/organizacoes');
    return resposta.data;
  },

  // Obter organização por ID
  obterPorId: async (id: string) => {
    const resposta = await api.get(`/organizacoes/${id}`);
    return resposta.data;
  },

  // Criar organização
  criar: async (dados: { nome: string }) => {
    const resposta = await api.post('/organizacoes', dados);
    return resposta.data;
  },
};

// ===========================================
// SERVIÇOS DE AMBIENTES
// ===========================================

export const ambientesApi = {
  // Listar ambientes da organização
  listar: async (organizacaoId: string) => {
    const resposta = await api.get(`/organizacoes/${organizacaoId}/ambientes`);
    return resposta.data;
  },

  // Obter ambiente por ID
  obterPorId: async (organizacaoId: string, id: string) => {
    const resposta = await api.get(`/organizacoes/${organizacaoId}/ambientes/${id}`);
    return resposta.data;
  },

  // Criar ambiente
  criar: async (
    organizacaoId: string,
    dados: { nome: string; tipo?: string; sistemaOperacional?: string },
  ) => {
    const resposta = await api.post(`/organizacoes/${organizacaoId}/ambientes`, dados);
    return resposta.data;
  },

  // Atualizar ambiente
  atualizar: async (
    organizacaoId: string,
    id: string,
    dados: { nome?: string; tipo?: string; sistemaOperacional?: string },
  ) => {
    const resposta = await api.put(`/organizacoes/${organizacaoId}/ambientes/${id}`, dados);
    return resposta.data;
  },

  // Remover ambiente
  remover: async (organizacaoId: string, id: string) => {
    const resposta = await api.delete(`/organizacoes/${organizacaoId}/ambientes/${id}`);
    return resposta.data;
  },
};

// ===========================================
// EXPORTAÇÃO PADRÃO
// ===========================================

export default api;
