// Agente de gerenciamento de máquinas
// Este arquivo será expandido conforme as necessidades do projeto

import { io } from 'socket.io-client';

// Configurações do agente
const CONFIGURACAO = {
  URL_API: process.env.API_URL || 'http://localhost:3001',
  TOKEN_AGENTE: process.env.AGENT_TOKEN || '',
};

// Conectar ao servidor
const socket = io(CONFIGURACAO.URL_API, {
  auth: {
    token: CONFIGURACAO.TOKEN_AGENTE,
  },
});

// Eventos de conexão
socket.on('connect', () => {
  console.log('✅ Agente conectado à API');
});

socket.on('disconnect', () => {
  console.log('❌ Agente desconectado da API');
});

socket.on('connect_error', (error) => {
  console.error('Erro de conexão:', error.message);
});

// Manter o processo ativo
console.log('🤖 Agente iniciado');
console.log(`📡 Conectando em: ${CONFIGURACAO.URL_API}`);
