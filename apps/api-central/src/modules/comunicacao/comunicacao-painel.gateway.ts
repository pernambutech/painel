// Gateway WebSocket para comunicação com o painel frontend
// Permite que o receba atualizações em tempo real (agentes, processos)

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaServico } from '../database/prisma.servico';

interface ClientePainel {
  socketId: string;
  usuarioId: string;
  organizacaoId: string;
}

@WebSocketGateway({
  cors: {
    // Permite qualquer origem (rede local)
    origin: true,
    methods: ['GET', 'POST'],
  },
  namespace: '/painel',
})
export class ComunicacaoPainelGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clientes = new Map<string, ClientePainel>();

  constructor(
    private jwtServico: JwtService,
    private prisma: PrismaServico,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;

      if (!token || typeof token !== 'string') {
        console.log('❌ Conexão do painel rejeitada: token não fornecido');
        client.disconnect();
        return;
      }

      // Validar JWT e obter dados do usuário
      let payload: any;
      try {
        payload = this.jwtServico.verify(token);
      } catch {
        console.log('❌ Conexão do painel rejeitada: token inválido');
        client.disconnect();
        return;
      }

      if (!payload?.sub) {
        console.log('❌ Conexão do painel rejeitada: token sem sub');
        client.disconnect();
        return;
      }

      // Buscar organização do usuário
      const membro = await this.prisma.membroOrganizacao.findFirst({
        where: { usuarioId: payload.sub },
        select: { organizacaoId: true },
      });

      if (!membro) {
        console.log('❌ Conexão do painel rejeitada: usuário sem organização');
        client.disconnect();
        return;
      }

      const cliente: ClientePainel = {
        socketId: client.id,
        usuarioId: payload.sub,
        organizacaoId: membro.organizacaoId,
      };

      this.clientes.set(client.id, cliente);

      // Entrar na sala da organização
      client.join(`org:${membro.organizacaoId}`);

      console.log(`✅ Painel conectado: usuário ${payload.sub} (${client.id})`);
    } catch (error) {
      console.error('❌ Erro na conexão do painel:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const cliente = this.clientes.get(client.id);
    if (cliente) {
      console.log(`⚠️  Painel desconectado: ${cliente.usuarioId}`);
      this.clientes.delete(client.id);
    }
  }

  // ===========================================
  // BROADCAST PARA A ORGANIZAÇÃO
  // ===========================================

  broadcastStatusAgente(organizacaoId: string, dados: Record<string, unknown>): void {
    this.server.to(`org:${organizacaoId}`).emit('status_agente', dados);
  }

  broadcastStatusProcesso(organizacaoId: string, dados: Record<string, unknown>): void {
    this.server.to(`org:${organizacaoId}`).emit('status_processo', dados);
  }

  broadcastAtualizacaoDashboard(organizacaoId: string): void {
    this.server.to(`org:${organizacaoId}`).emit('dashboard_atualizado');
  }
}
