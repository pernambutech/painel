// Gateway WebSocket para comunicação com agentes
// Gerencia conexões, autenticação, heartbeat e envio de comandos

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AgentesServico } from '../agentes/agentes.servico';

// ===========================================
// INTERFACE DO CLIENTE CONECTADO
// ===========================================

interface ClienteAgente {
  socketId: string;
  agenteId: string;
  ambienteId: string;
  organizacaoId: string;
  conectadoEm: Date;
}

// ===========================================
// GATEWAY PRINCIPAL
// ===========================================

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/agentes',
})
export class ComunicacaoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Clientes conectados (socketId → dados do agente)
  private clientes = new Map<string, ClienteAgente>();

  constructor(private agentesServico: AgentesServico) {}

  // ===========================================
  // CONEXÃO
  // ===========================================

  async handleConnection(client: Socket): Promise<void> {
    try {
      // Extrair token do handshake
      const token = client.handshake.auth?.token;

      if (!token) {
        console.log('❌ Conexão rejeitada: token não fornecido');
        client.disconnect();
        return;
      }

      // Validar token e obter dados do agente
      const agente = await this.agentesServico.obterPorToken(token);

      if (!agente) {
        console.log('❌ Conexão rejeitada: token inválido');
        client.disconnect();
        return;
      }

      // Registrar cliente conectado
      const cliente: ClienteAgente = {
        socketId: client.id,
        agenteId: agente.id,
        ambienteId: agente.ambienteId,
        organizacaoId: agente.organizacaoId,
        conectadoEm: new Date(),
      };

      this.clientes.set(client.id, cliente);

      // Atualizar status do agente para online
      await this.agentesServico.registrar({
        token,
        nome: agente.nome,
        sistemaOperacional: agente.sistemaOperacional || 'linux',
        versao: agente.versao || '0.1.0',
      });

      // Entrar na sala da organização
      client.join(`org:${agente.organizacaoId}`);

      console.log(`✅ Agente conectado: ${agente.nome} (${client.id})`);
    } catch (error) {
      console.error('❌ Erro na conexão:', error);
      client.disconnect();
    }
  }

  // ===========================================
  // DESCONEXÃO
  // ===========================================

  async handleDisconnect(client: Socket): Promise<void> {
    const cliente = this.clientes.get(client.id);

    if (cliente) {
      // Marcar agente como offline
      await this.agentesServico.marcarComoOffline(cliente.agenteId);

      console.log(`⚠️  Agente desconectado: ${cliente.agenteId}`);

      this.clientes.delete(client.id);
    }
  }

  // ===========================================
  // HEARTBEAT
  // ===========================================

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    dados: {
      sistema: {
        cpuUso: number;
        memoriaUso: number;
        memoriaTotal: number;
        uptime: number;
      };
      processos: {
        total: number;
        online: number;
        offline: number;
      };
    },
  ): Promise<void> {
    const cliente = this.clientes.get(client.id);

    if (cliente) {
      await this.agentesServico.processarHeartbeat({
        agenteId: cliente.agenteId,
        sistema: dados.sistema,
        processos: dados.processos,
      });
    }
  }

  // ===========================================
  // RESPOSTA DE COMANDO
  // ===========================================

  @SubscribeMessage('resposta_comando')
  async handleRespostaComando(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    dados: {
      comandoId: string;
      status: string;
      dados?: Record<string, unknown>;
      erro?: string;
    },
  ): Promise<void> {
    const cliente = this.clientes.get(client.id);

    if (cliente) {
      // Emitir para a organização
      this.server.to(`org:${cliente.organizacaoId}`).emit('comando_respondido', {
        agenteId: cliente.agenteId,
        ambienteId: cliente.ambienteId,
        ...dados,
      });
    }
  }

  // ===========================================
  // ENVIAR COMANDO PARA AGENTE
  // ===========================================

  async enviarComando(
    agenteId: string,
    comando: {
      id: string;
      tipo: string;
      dados?: Record<string, unknown>;
    },
  ): Promise<boolean> {
    // Encontrar socket do agente
    const cliente = Array.from(this.clientes.values()).find((c) => c.agenteId === agenteId);

    if (!cliente) {
      return false; // Agente não está conectado
    }

    const socket = this.server.sockets.sockets.get(cliente.socketId);

    if (!socket) {
      return false;
    }

    // Enviar comando
    socket.emit('comando', comando);
    return true;
  }

  // ===========================================
  // OBTER AGENTES CONECTADOS
  // ===========================================

  obterAgentesConectados(organizacaoId: string): ClienteAgente[] {
    return Array.from(this.clientes.values()).filter((c) => c.organizacaoId === organizacaoId);
  }

  // ===========================================
  // VERIFICAR SE AGENTE ESTÁ CONECTADO
  // ===========================================

  agenteConectado(agenteId: string): boolean {
    return Array.from(this.clientes.values()).some((c) => c.agenteId === agenteId);
  }
}
