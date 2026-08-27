/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar modo estrito
  reactStrictMode: true,

  // Configurações de build
  output: 'standalone',

  // Configurações de otimização
  experimental: {
    // Otimizar importações
    optimizePackageImports: ['@painel/tipos', '@painel/configuracoes'],
  },
};

module.exports = nextConfig;
