// Agente de gerenciamento de máquinas
// Conecta-se à API central via WebSocket para receber comandos

import { io, Socket } from 'socket.io-client';

// ===========================================
// CONFIGURAÇÃO
// ===========================================

const CONFIGURACAO = {
  URL_API: process.env.API_URL || 'http://localhost:3001',
  TOKEN_AGENTE: process.env.AGENT_TOKEN || '',
  // Intervalo entre tentativas de reconexão (ms)
  INTERVALO_TENTATIVA: 5000,
  // Máximo de erros consecutivos antes de parar de logar
  MAX_ERROS_LOG: 3,
};

// ===========================================
// ESTADO
// ===========================================

let socket: Socket | null = null;
let errosConsecutivos = 0;

// ===========================================
// CONEXÃO
// ===========================================

function conectar(): void {
  console.log('🤖 Agente iniciado');
  console.log(`📡 Conectando em: ${CONFIGURACAO.URL_API}`);

  socket = io(CONFIGURACAO.URL_API, {
    auth: {
      token: CONFIGURACAO.TOKEN_AGENTE,
    },
    // Reconexão automática
    reconnection: true,
    // Intervalo entre reconexões
    reconnectionDelay: CONFIGURACAO.INTERVALO_TENTATIVA,
    // Máximo de tentativas (0 = infinito)
    reconnectionAttempts: 0,
    // Timeout da conexão
    timeout: 10000,
  });

  // Evento: conectado
  socket.on('connect', () => {
    errosConsecutivos = 0;
    console.log('✅ Agente conectado à API');
    console.log(`   ID: ${socket?.id}`);
  });

  // Evento: desconectado
  socket.on('disconnect', (motivo) => {
    console.log(`⚠️  Agente desconectado da API`);
    console.log(`   Motivo: ${motivo}`);
    console.log(`   Tentando reconectar em ${CONFIGURACAO.INTERVALO_TENTATIVA / 1000}s...`);
  });

  // Evento: erro de conexão
  socket.on('connect_error', (erro) => {
    errosConsecutivos++;

    // Só loga os primeiros erros para não poluir o terminal
    if (errosConsecutivos <= CONFIGURACAO.MAX_ERROS_LOG) {
      console.error(`❌ Erro de conexão: ${erro.message}`);

      if (errosConsecutivos === CONFIGURACAO.MAX_ERROS_LOG) {
        console.log(`   (... silenciando erros de conexão até reconectar)`);
      }
    }
  });

  // Evento: reconectando
  socket.on('reconnect_attempt', (tentativa) => {
    if (tentativa % 5 === 0) {
      console.log(`🔄 Tentativa de reconexão #${tentativa}...`);
    }
  });

  // Evento: reconectado
  socket.on('reconnect', () => {
    console.log('✅ Reconectado com sucesso!');
  });

  // Evento: falha definitiva de reconexão
  socket.on('reconnect_failed', () => {
    console.error('❌ Falha ao reconectar. Verifique se a API está rodando.');
  });
}

// ===========================================
// INICIALIZAÇÃO
// ===========================================

conectar();
