// Agente de gerenciamento de máquinas
// Conecta-se à API central via WebSocket para receber comandos

import { io, Socket } from 'socket.io-client';
import * as os from 'os';
import { execSync } from 'child_process';

// ===========================================
// CONFIGURAÇÃO
// ===========================================

const CONFIGURACAO = {
  URL_API: process.env.AGENT_API_URL || 'http://localhost:3001',
  TOKEN_AGENTE: process.env.AGENT_TOKEN || '',
  // Intervalo entre tentativas de reconexão (ms)
  INTERVALO_TENTATIVA: 5000,
  // Máximo de erros consecutivos antes de parar de logar
  MAX_ERROS_LOG: 3,
  // Intervalo de heartbeat (30 segundos)
  INTERVALO_HEARTBEAT: 30000,
};

// ===========================================
// ESTADO
// ===========================================

let socket: Socket | null = null;
let errosConsecutivos = 0;
let intervaloHeartbeat: NodeJS.Timeout | null = null;
let inicioAgent: Date = new Date();

// ===========================================
// IDENTIFICAÇÃO DA MÁQUINA
// ===========================================

function obterInformacoesSistema() {
  return {
    hostname: os.hostname(),
    plataforma: os.platform(),
    arquitetura: os.arch(),
    cpus: os.cpus().length,
    memoriaTotal: os.totalmem(),
    memoriaLivre: os.freemem(),
    uptime: os.uptime(),
    usuario: os.userInfo().username,
    nodeVersion: process.version,
  };
}

// ===========================================
// CÁLCULO DE USO DE CPU
// ===========================================

function calcularUsoCpu(): number {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  for (const cpu of cpus) {
    for (const tipo in cpu.times) {
      totalTick += cpu.times[tipo as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  }

  return Math.round((1 - totalIdle / totalTick) * 100);
}

// ===========================================
// LISTAR PORTAS EM USO
// ===========================================

function listarPortasEmUso(): { porta: number; processo: string; pid: number }[] {
  try {
    const plataforma = os.platform();
    let saida = '';

    if (plataforma === 'win32') {
      saida = execSync('netstat -ano | findstr LISTENING', { encoding: 'utf-8', timeout: 10000 });
    } else {
      saida = execSync('ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null', { encoding: 'utf-8', timeout: 10000 });
    }

    const portas: { porta: number; processo: string; pid: number }[] = [];
    const linhas = saida.split('\n').filter((l) => l.trim());

    for (const linha of linhas) {
      if (plataforma === 'win32') {
        // Formato: TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    1234
        const partes = linha.trim().split(/\s+/);
        if (partes.length >= 5 && partes[0] === 'TCP') {
          const addrPorta = partes[1];
          const ultimo = partes[partes.length - 1];
          const portaNum = parseInt(addrPorta.split(':').pop() || '0', 10);
          const pidNum = parseInt(ultimo, 10);
          if (portaNum > 0 && !isNaN(pidNum)) {
            portas.push({ porta: portaNum, processo: 'desconhecido', pid: pidNum });
          }
        }
      }
    }

    return portas;
  } catch {
    return [];
  }
}

// ===========================================
// OBTER STATUS DO AGENTE
// ===========================================

function obterStatus() {
  const informacoes = obterInformacoesSistema();
  const usoCpu = calcularUsoCpu();
  const memoriaUso = informacoes.memoriaTotal - informacoes.memoriaLivre;
  const portas = listarPortasEmUso();

  return {
    conectado: socket?.connected || false,
    conectadoEm: inicioAgent.toISOString(),
    sistema: {
      ...informacoes,
      cpuUso: usoCpu,
      memoriaUso,
    },
    portasEmUso: portas.length,
    portas: portas.slice(0, 20), // Limitar a 20 para não sobrecarregar
  };
}

// ===========================================
// CONEXÃO
// ===========================================

function conectar(): void {
  if (!CONFIGURACAO.TOKEN_AGENTE) {
    console.error('❌ Token do agente não configurado.');
    console.error('   Defina a variável de ambiente AGENT_TOKEN');
    console.error('   Exemplo: AGENT_TOKEN=painel_xxxxx npm run dev');
    process.exit(1);
  }

  console.log('🤖 Agente iniciado');
  console.log(`📡 Conectando em: ${CONFIGURACAO.URL_API}`);
  console.log(`🖥️  Máquina: ${obterInformacoesSistema().hostname}`);

  socket = io(`${CONFIGURACAO.URL_API}/agentes`, {
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
    console.log(`   Socket ID: ${socket?.id}`);

    // Iniciar envio de heartbeat
    iniciarHeartbeat();
  });

  // Evento: desconectado
  socket.on('disconnect', (motivo) => {
    console.log(`⚠️  Agente desconectado da API`);
    console.log(`   Motivo: ${motivo}`);
    console.log(`   Tentando reconectar em ${CONFIGURACAO.INTERVALO_TENTATIVA / 1000}s...`);

    // Parar heartbeat
    pararHeartbeat();
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

  // Evento: comando recebido da API
  socket.on('comando', (comando) => {
    console.log(`📥 Comando recebido: ${comando.tipo} (${comando.id})`);
    processarComando(comando);
  });
}

// ===========================================
// HEARTBEAT
// ===========================================

function iniciarHeartbeat(): void {
  // Parar intervalo existente se houver
  pararHeartbeat();

  // Enviar heartbeat imediatamente
  enviarHeartbeat();

  // Configurar intervalo
  intervaloHeartbeat = setInterval(() => {
    enviarHeartbeat();
  }, CONFIGURACAO.INTERVALO_HEARTBEAT);
}

function pararHeartbeat(): void {
  if (intervaloHeartbeat) {
    clearInterval(intervaloHeartbeat);
    intervaloHeartbeat = null;
  }
}

function enviarHeartbeat(): void {
  if (!socket?.connected) return;

  const informacoes = obterInformacoesSistema();
  const usoCpu = calcularUsoCpu();
  const memoriaUso = informacoes.memoriaTotal - informacoes.memoriaLivre;

  socket.emit('heartbeat', {
    sistema: {
      cpuUso: usoCpu,
      memoriaUso: memoriaUso,
      memoriaTotal: informacoes.memoriaTotal,
      uptime: Math.floor(informacoes.uptime),
    },
    processos: {
      total: 0,
      online: 0,
      offline: 0,
    },
  });
}

// ===========================================
// PROCESSAMENTO DE COMANDOS
// ===========================================

async function processarComando(comando: any): Promise<void> {
  const inicio = Date.now();

  try {
    let resultado: Record<string, unknown> = {};

    switch (comando.tipo) {
      case 'OBTER_INFORMACOES_SISTEMA':
        resultado = obterInformacoesSistema();
        break;

      case 'OBTER_STATUS':
        resultado = obterStatus();
        break;

      case 'LISTAR_PORTAS':
        resultado = { portas: listarPortasEmUso() };
        break;

      default:
        throw new Error(`Comando não suportado: ${comando.tipo}`);
    }

    // Enviar resposta de sucesso
    socket?.emit('resposta_comando', {
      comandoId: comando.id,
      status: 'sucesso',
      dados: resultado,
    });

    console.log(`✅ Comando executado: ${comando.tipo} (${Date.now() - inicio}ms)`);
  } catch (erro: any) {
    // Enviar resposta de falha
    socket?.emit('resposta_comando', {
      comandoId: comando.id,
      status: 'falhou',
      erro: erro.message,
    });

    console.error(`❌ Erro ao executar comando: ${erro.message}`);
  }
}

// ===========================================
// TRATAMENTO DE ERROS NÃO TRATADOS
// ===========================================

process.on('uncaughtException', (erro) => {
  console.error('❌ Erro não tratado:', erro);
  process.exit(1);
});

process.on('unhandledRejection', (razao) => {
  console.error('❌ Rejeição não tratada:', razao);
});

// ===========================================
// INICIALIZAÇÃO
// ===========================================

conectar();
