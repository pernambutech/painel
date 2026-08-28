const path = require('path');
const fs = require('fs');

const raiz = __dirname;
const arquivosEnv = [path.join(raiz, '.env'), path.join(raiz, 'apps', 'api-central', '.env')];
const variaveisEnv = Object.fromEntries(
  arquivosEnv
    .filter((arquivo) => fs.existsSync(arquivo))
    .flatMap((arquivo) =>
      fs
        .readFileSync(arquivo, 'utf8')
        .split(/\r?\n/)
        .filter((linha) => linha && !linha.startsWith('#') && linha.includes('='))
        .map((linha) => {
          const separador = linha.indexOf('=');
          return [linha.slice(0, separador), linha.slice(separador + 1).replace(/^"|"$/g, '')];
        }),
    ),
);
const ambiente = {
  ...variaveisEnv,
  NODE_ENV: process.env.NODE_ENV || 'production',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRACAO: process.env.JWT_EXPIRACAO || '86400',
};

module.exports = {
  apps: [
    {
      name: 'painel-api',
      cwd: path.join(raiz, 'apps', 'api-central'),
      script: 'dist/main.js',
      interpreter: 'node',
      env: { ...ambiente, PORT: '3001' },
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
    },
    {
      name: 'painel-web',
      cwd: path.join(raiz, 'apps', 'painel-web'),
      script: path.join(raiz, 'apps', 'painel-web', '.next', 'standalone', 'server.js'),
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        PORT: '3000',
      },
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
    },
    {
      name: 'painel-agente',
      cwd: path.join(raiz, 'apps', 'agente'),
      script: 'dist/index.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        AGENT_API_URL: process.env.AGENT_API_URL || 'http://localhost:3001',
        AGENT_TOKEN: process.env.AGENT_TOKEN,
      },
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};