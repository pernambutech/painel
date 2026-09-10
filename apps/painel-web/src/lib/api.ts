// Cliente HTTP para comunicação com a API Central

import axios from 'axios';

// ===========================================
// URL BASE DA API
// ===========================================

// Detecta automaticamente o host atual e usa porta 4001 para a API
// Permite acesso via IP (ex: 192.168.1.66:4000 → API em 192.168.1.66:4001)
function obterUrlApi(): string {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    // Usa o mesmo hostname da página, mas porta 4001
    return `${window.location.protocol}//${window.location.hostname}:4001`;
  }
  return 'http://localhost:4001';
}

// ===========================================
// INSTÂNCIA DO AXIOS
// ===========================================

const api = axios.create({
  // URL base da API Central
  baseURL: obterUrlApi(),
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

  atualizarPerfil: async (dados: {
    nome?: string;
    sobrenome?: string;
    email?: string;
    cargo?: string;
    timezone?: string;
  }) => {
    const resposta = await api.put('/auth/perfil', dados);
    return resposta.data;
  },

  alterarSenha: async (dados: { senhaAtual: string; novaSenha: string }) => {
    const resposta = await api.put('/auth/senha', dados);
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

  atualizar: async (id: string, dados: { nome: string }) => {
    const resposta = await api.put(`/organizacoes/${id}`, dados);
    return resposta.data;
  },

  // Criar organização
  criar: async (dados: { nome: string }) => {
    const resposta = await api.post('/organizacoes', dados);
    return resposta.data;
  },

  // Preferências (aparência)
  obterPreferencias: async (id: string) => {
    const resposta = await api.get(`/organizacoes/${id}/preferencias`);
    return resposta.data;
  },

  atualizarPreferencias: async (id: string, preferencias: Record<string, unknown>) => {
    const resposta = await api.patch(`/organizacoes/${id}/preferencias`, preferencias);
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
// SERVIÇOS DE AGENTES
// ===========================================

export const agentesApi = {
  // Gerar token para ambiente
  gerarToken: async (organizacaoId: string, ambienteId: string) => {
    const resposta = await api.post(
      `/organizacoes/${organizacaoId}/agentes/ambiente/${ambienteId}/token`,
    );
    return resposta.data;
  },

  // Listar agentes da organização
  listar: async (organizacaoId: string) => {
    const resposta = await api.get(`/organizacoes/${organizacaoId}/agentes`);
    return resposta.data;
  },

  // Obter agente por ID
  obterPorId: async (organizacaoId: string, id: string) => {
    const resposta = await api.get(`/organizacoes/${organizacaoId}/agentes/${id}`);
    return resposta.data;
  },

  // Obter agente por ambiente
  obterPorAmbiente: async (organizacaoId: string, ambienteId: string) => {
    const resposta = await api.get(`/organizacoes/${organizacaoId}/agentes/ambiente/${ambienteId}`);
    return resposta.data;
  },

  // Desativar agente
  desativar: async (organizacaoId: string, id: string) => {
    const resposta = await api.delete(`/organizacoes/${organizacaoId}/agentes/${id}`);
    return resposta.data;
  },

  // Persistir processos PM2 para reinicialização automática do sistema
  salvarPm2: async (organizacaoId: string, id: string) => {
    const resposta = await api.post(`/organizacoes/${organizacaoId}/agentes/${id}/pm2/save`);
    return resposta.data;
  },

  // Obter diretórios autorizados do agente
  obterDiretoriosAutorizados: async (organizacaoId: string, id: string) => {
    const resposta = await api.get(`/organizacoes/${organizacaoId}/agentes/${id}/diretorios`);
    return resposta.data as string[];
  },

  // Atualizar diretórios autorizados do agente
  atualizarDiretoriosAutorizados: async (organizacaoId: string, id: string, diretorios: string[]) => {
    const resposta = await api.post(`/organizacoes/${organizacaoId}/agentes/${id}/diretorios`, {
      diretorios,
    });
    return resposta.data;
  },

  // Enviar comando estruturado ao agente (ex: OBTER_STATUS para testar conexão)
  enviarComando: async (
    organizacaoId: string,
    id: string,
    dados: { tipo: string; dados?: Record<string, unknown>; timeoutMs?: number },
  ) => {
    const resposta = await api.post(
      `/organizacoes/${organizacaoId}/agentes/${id}/comandos`,
      dados,
    );
    return resposta.data;
  },
};

export const servicosPm2Api = {
  salvar: async (organizacaoId: string, agenteId: string) => {
    return agentesApi.salvarPm2(organizacaoId, agenteId);
  },
};

// ===========================================
// SERVIÇOS DE PROJETOS
// ===========================================

export const projetosApi = {
  // Listar projetos da organização
  listar: async (organizacaoId: string, incluirArquivados = false) => {
    const resposta = await api.get(`/organizacoes/${organizacaoId}/projetos`, {
      params: incluirArquivados ? { incluirArquivados: 'true' } : {},
    });
    return resposta.data;
  },

  // Obter projeto por ID
  obterPorId: async (organizacaoId: string, id: string) => {
    const resposta = await api.get(`/organizacoes/${organizacaoId}/projetos/${id}`);
    return resposta.data;
  },

  // Criar projeto
  criar: async (organizacaoId: string, dados: { nome: string; descricao?: string }) => {
    const resposta = await api.post(`/organizacoes/${organizacaoId}/projetos`, dados);
    return resposta.data;
  },

  // Atualizar projeto
  atualizar: async (
    organizacaoId: string,
    id: string,
    dados: { nome?: string; descricao?: string },
  ) => {
    const resposta = await api.put(`/organizacoes/${organizacaoId}/projetos/${id}`, dados);
    return resposta.data;
  },

  // Arquivar projeto
  arquivar: async (organizacaoId: string, id: string) => {
    const resposta = await api.patch(`/organizacoes/${organizacaoId}/projetos/${id}/arquivar`);
    return resposta.data;
  },

  // Reativar projeto
  reativar: async (organizacaoId: string, id: string) => {
    const resposta = await api.patch(`/organizacoes/${organizacaoId}/projetos/${id}/reativar`);
    return resposta.data;
  },
};

// ===========================================
// SERVIÇOS DE SERVIÇOS
// ===========================================

export const servicosApi = {
  // Listar todos os serviços da organização
  listarTodos: async (organizacaoId: string) => {
    const resposta = await api.get(`/organizacoes/${organizacaoId}/servicos`);
    return resposta.data;
  },

  // Listar serviços de um projeto
  listarPorProjeto: async (organizacaoId: string, projetoId: string) => {
    const resposta = await api.get(`/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos`);
    return resposta.data;
  },

  // Obter serviço por ID
  obterPorId: async (organizacaoId: string, projetoId: string, id: string) => {
    const resposta = await api.get(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}`,
    );
    return resposta.data;
  },

  // Criar serviço
  criar: async (
    organizacaoId: string,
    projetoId: string,
    dados: {
      nome: string;
      tipo?: string;
      diretorio?: string;
      comando?: string;
      porta?: number;
      ambienteId?: string;
      variaveisAmbiente?: Record<string, string>;
      healthCheckUrl?: string;
    },
  ) => {
    const resposta = await api.post(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos`,
      dados,
    );
    return resposta.data;
  },

  // Atualizar serviço
  atualizar: async (
    organizacaoId: string,
    projetoId: string,
    id: string,
    dados: {
      nome?: string;
      tipo?: string;
      diretorio?: string;
      comando?: string;
      porta?: number | null;
      ambienteId?: string | null;
      variaveisAmbiente?: Record<string, string> | null;
      healthCheckUrl?: string | null;
    },
  ) => {
    const resposta = await api.put(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}`,
      dados,
    );
    return resposta.data;
  },

  // Remover serviço
  remover: async (organizacaoId: string, projetoId: string, id: string) => {
    const resposta = await api.delete(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}`,
    );
    return resposta.data;
  },

  // Iniciar serviço (via PM2 no agente)
  iniciar: async (organizacaoId: string, projetoId: string, id: string) => {
    const resposta = await api.post(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/iniciar`,
    );
    return resposta.data;
  },

  // Parar serviço
  parar: async (organizacaoId: string, projetoId: string, id: string) => {
    const resposta = await api.post(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/parar`,
    );
    return resposta.data;
  },

  // Reiniciar serviço
  reiniciar: async (organizacaoId: string, projetoId: string, id: string) => {
    const resposta = await api.post(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/reiniciar`,
    );
    return resposta.data;
  },

  // Obter status do serviço no PM2
  obterStatus: async (organizacaoId: string, projetoId: string, id: string) => {
    const resposta = await api.get(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/status`,
    );
    return resposta.data;
  },

  // Obter logs do serviço (via PM2 no agente)
  obterLogs: async (
    organizacaoId: string,
    projetoId: string,
    id: string,
    opcoes?: { linhas?: number; tipo?: string },
  ) => {
    const resposta = await api.get(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/logs`,
      { params: opcoes },
    );
    return resposta.data;
  },

  // ===========================================
  // OPERAÇÕES GIT
  // ===========================================

  gitStatus: async (organizacaoId: string, projetoId: string, id: string) => {
    const resposta = await api.get(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/git/status`,
    );
    return resposta.data;
  },

  gitBranch: async (organizacaoId: string, projetoId: string, id: string) => {
    const resposta = await api.get(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/git/branch`,
    );
    return resposta.data;
  },

  gitPull: async (
    organizacaoId: string,
    projetoId: string,
    id: string,
    dados?: { remoto?: string; branch?: string },
  ) => {
    const resposta = await api.post(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/git/pull`,
      dados || {},
    );
    return resposta.data;
  },

  gitLog: async (organizacaoId: string, projetoId: string, id: string, limite = 50) => {
    const resposta = await api.get(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/git/log`,
      { params: { limite } },
    );
    return resposta.data;
  },

  gitCheckout: async (organizacaoId: string, projetoId: string, id: string, hash: string) => {
    const resposta = await api.post(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/git/checkout`,
      { hash },
    );
    return resposta.data;
  },

  gitCheckoutBranch: async (organizacaoId: string, projetoId: string, id: string, branch: string) => {
    const resposta = await api.post(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/git/checkout-branch`,
      { branch },
    );
    return resposta.data;
  },

  // ===========================================
  // HEALTH CHECK — Verificação de saúde
  // ===========================================

  verificarHealthCheck: async (organizacaoId: string, projetoId: string, id: string) => {
    const resposta = await api.get(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/health-check`,
    );
    return resposta.data;
  },

  // ===========================================
  // VERIFICAÇÃO DE PORTA
  // ===========================================

  verificarPorta: async (organizacaoId: string, projetoId: string, id: string) => {
    const resposta = await api.get(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/verificar-porta`,
    );
    return resposta.data;
  },

  // ===========================================
  // VERIFICAÇÃO DE DIRETÓRIO
  // ===========================================

  verificarDiretorio: async (organizacaoId: string, projetoId: string, id: string) => {
    const resposta = await api.get(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${id}/verificar-diretorio`,
    );
    return resposta.data;
  },
};

// ===========================================
// EXECUÇÕES / HISTÓRICO
// ===========================================

export const execucoesApi = {
  // Listar histórico da organização (com paginação)
  listarPorOrganizacao: async (organizacaoId: string, limite = 20, pagina = 1) => {
    const resposta = await api.get(`/organizacoes/${organizacaoId}/execucoes`, {
      params: { limite, pagina },
    });
    return resposta.data;
  },

  // Listar histórico de um serviço
  listarPorServico: async (organizacaoId: string, projetoId: string, servicoId: string) => {
    const resposta = await api.get(
      `/organizacoes/${organizacaoId}/projetos/${projetoId}/servicos/${servicoId}/execucoes`,
    );
    return resposta.data;
  },

  // Obter execução por ID
  obterPorId: async (organizacaoId: string, id: string) => {
    const resposta = await api.get(`/organizacoes/${organizacaoId}/execucoes/${id}`);
    return resposta.data;
  },
};

// ===========================================
// DASHBOARD
// ===========================================

export const dashboardApi = {
  // Dados consolidados do dashboard (projetos, serviços, status PM2)
  obterDados: async (organizacaoId: string) => {
    const resposta = await api.get(`/organizacoes/${organizacaoId}/dashboard`);
    return resposta.data;
  },
};

// ===========================================
// EXPORTAÇÃO PADRÃO
// ===========================================

export default api;
