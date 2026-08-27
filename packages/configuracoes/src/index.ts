// Configurações compartilhadas
// Este arquivo será expandido conforme as necessidades do projeto

// Configurações gerais
export const CONFIGURACOES_GERAIS = {
  VERSAO: '0.1.0',
  NOME_APP: 'Painel',
  AMBIENTES: ['desenvolvimento', 'homologacao', 'producao'] as const,
};

// Configurações de paginação
export const CONFIGURACOES_PAGINACAO = {
  ITENS_POR_PAGINA_PADRAO: 20,
  ITENS_POR_PAGINA_MAXIMO: 100,
};

// Configurações de segurança
export const CONFIGURACOES_SEGURANCA = {
  TEMPO_MAXIMO_SESSAO: 24 * 60 * 60 * 1000, // 24 horas
  TOKEN_AGENTE_NAO_EXPIRA: true,
};
