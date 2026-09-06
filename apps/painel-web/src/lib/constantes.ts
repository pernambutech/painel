// Constantes compartilhadas do frontend
// Tipos de ambiente, serviço e labels usados em toda a aplicação

// ===========================================
// TIPOS DE AMBIENTE
// ===========================================

export const TIPOS_AMBIENTE = [
  { valor: 'local', label: 'Local' },
  { valor: 'desenvolvimento', label: 'Desenvolvimento' },
  { valor: 'homologacao', label: 'Homologação' },
  { valor: 'producao', label: 'Produção' },
  { valor: 'teste', label: 'Teste' },
  { valor: 'staging', label: 'Staging' },
] as const;

export type TipoAmbiente = (typeof TIPOS_AMBIENTE)[number]['valor'];

export function obterLabelAmbiente(valor: string): string {
  return TIPOS_AMBIENTE.find((t) => t.valor === valor)?.label || valor;
}

// ===========================================
// TIPOS DE SERVIÇO
// ===========================================

export const TIPOS_SERVICO = [
  { valor: 'frontend', label: 'Frontend' },
  { valor: 'backend', label: 'Backend' },
  { valor: 'api', label: 'API' },
  { valor: 'worker', label: 'Worker' },
  { valor: 'bot', label: 'Bot' },
  { valor: 'custom', label: 'Personalizado' },
] as const;

export type TipoServico = (typeof TIPOS_SERVICO)[number]['valor'];

export function obterLabelServico(valor: string): string {
  return TIPOS_SERVICO.find((t) => t.valor === valor)?.label || valor;
}

// ===========================================
// SISTEMAS OPERACIONAIS
// ===========================================

export const SISTEMAS_OPERACIONAIS = [
  { valor: 'linux', label: 'Linux' },
  { valor: 'windows', label: 'Windows' },
  { valor: 'macos', label: 'macOS' },
] as const;

// ===========================================
// STATUS DO PM2
// ===========================================

export const STATUS_PM2_LABELS: Record<string, string> = {
  online: 'Online',
  stopped: 'Parado',
  errored: 'Erro',
  desconhecido: 'Desconhecido',
};

// ===========================================
// AÇÕES DO HISTÓRICO
// ===========================================

export const ACAO_LABELS: Record<string, string> = {
  iniciar: 'Iniciar',
  parar: 'Parar',
  reiniciar: 'Reiniciar',
  // Git
  git_pull: 'Git Pull',
  git_fetch: 'Git Fetch',
  git_checkout: 'Git Checkout',
  git_branch: 'Git Branch',
  // Criação / Gerenciamento
  criar_servico: 'Criar serviço',
  atualizar_servico: 'Atualizar serviço',
  remover_servico: 'Remover serviço',
  criar_projeto: 'Criar projeto',
  atualizar_projeto: 'Atualizar projeto',
  // Outros
  salvar_pm2: 'Salvar PM2',
  executar_comando: 'Executar comando',
};

// ===========================================
// ITENS POR PÁGINA
// ===========================================

export const ITENS_POR_PAGINA_OPCOES = [
  { valor: '10', label: '10' },
  { valor: '20', label: '20' },
  { valor: '50', label: '50' },
  { valor: '100', label: '100' },
] as const;

// ===========================================
// URL DE ACESSO AO SERVIÇO
// ===========================================

/**
 * Gera a URL de acesso a um serviço com base no hostname atual do navegador.
 *
 * - Se o usuário estiver acessando via localhost → localhost:porta
 * - Se estiver acessando via IP → ip:porta
 *
 * @param porta - Porta do serviço
 * @returns URL completa do serviço (ex: http://192.168.1.66:3000)
 */
export function gerarUrlServico(porta: number): string | null {
  if (typeof window === 'undefined' || !porta) return null;

  const protocolo = window.location.protocol; // http: ou https:
  const hostname = window.location.hostname; // localhost, 192.168.1.66, etc.

  return `${protocolo}//${hostname}:${porta}`;
}
