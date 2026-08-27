// Serviço de agentes
// Gerencia registro, autenticação, heartbeat e status dos agentes

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaServico } from '../database/prisma.servico';
import { v4 as uuidv4 } from 'uuid';
import {
  RegistrarAgenteDto,
  HeartbeatAgenteDto,
  RespostaAgente,
  RespostaTokenAgente,
} from './dto/agente.dto';

@Injectable()
export class AgentesServico {
  // Intervalo máximo sem heartbeat para considerar offline (90 segundos)
  private readonly INTERVALO_OFFLINE_MS = 90 * 1000;

  constructor(private prisma: PrismaServico) {}

  // ===========================================
  // GERAR TOKEN PARA AMBIENTE
  // ===========================================

  async gerarToken(
    ambienteId: string,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<RespostaTokenAgente> {
    // Verificar se o usuário é membro da organização
    await this.verificarMembro(organizacaoId, usuarioId);

    // Verificar se o ambiente existe
    const ambiente = await this.prisma.ambiente.findFirst({
      where: { id: ambienteId, organizacaoId },
    });

    if (!ambiente) {
      throw new NotFoundException('Ambiente não encontrado');
    }

    // Verificar se já existe um agente ativo para este ambiente
    const agenteExistente = await this.prisma.agente.findFirst({
      where: { ambienteId, ativo: true },
    });

    if (agenteExistente) {
      // Se já existe, retornar o token existente
      return {
        token: agenteExistente.token,
        agenteId: agenteExistente.id,
        ambienteId,
      };
    }

    // Gerar token único
    const token = `painel_${uuidv4().replace(/-/g, '')}`;

    // Criar agente
    const agente = await this.prisma.agente.create({
      data: {
        nome: ambiente.nome,
        token,
        ambienteId,
        organizacaoId,
        status: 'offline',
      },
    });

    return {
      token: agente.token,
      agenteId: agente.id,
      ambienteId,
    };
  }

  // ===========================================
  // REGISTRAR AGENTE (via WebSocket)
  // ===========================================

  async registrar(dados: RegistrarAgenteDto): Promise<RespostaAgente> {
    // Buscar agente pelo token
    const agente = await this.prisma.agente.findUnique({
      where: { token: dados.token },
    });

    if (!agente) {
      throw new UnauthorizedException('Token de agente inválido');
    }

    if (!agente.ativo) {
      throw new UnauthorizedException('Agente desativado');
    }

    // Atualizar dados do agente
    const agenteAtualizado = await this.prisma.agente.update({
      where: { id: agente.id },
      data: {
        status: 'online',
        ultimoHeartbeat: new Date(),
        versao: dados.versao,
        sistemaOperacional: dados.sistemaOperacional,
      },
    });

    return this.mapearResposta(agenteAtualizado);
  }

  // ===========================================
  // PROCESSAR HEARTBEAT
  // ===========================================

  async processarHeartbeat(dados: HeartbeatAgenteDto): Promise<void> {
    await this.prisma.agente.update({
      where: { id: dados.agenteId },
      data: {
        ultimoHeartbeat: new Date(),
        status: 'online',
        cpuUso: dados.sistema.cpuUso,
        memoriaUso: dados.sistema.memoriaUso,
        memoriaTotal: dados.sistema.memoriaTotal,
        uptime: dados.sistema.uptime,
      },
    });
  }

  // ===========================================
  // MARCAR AGENTE COMO OFFLINE
  // ===========================================

  async marcarComoOffline(agenteId: string): Promise<void> {
    await this.prisma.agente.update({
      where: { id: agenteId },
      data: { status: 'offline' },
    });
  }

  // ===========================================
  // VERIFICAR AGENTES INATIVOS
  // ===========================================

  async verificarAgentesInativos(): Promise<string[]> {
    const dataLimite = new Date(Date.now() - this.INTERVALO_OFFLINE_MS);

    // Buscar agentes que estão marcados como online mas não enviaram heartbeat
    const agentesInativos = await this.prisma.agente.findMany({
      where: {
        status: 'online',
        ultimoHeartbeat: {
          lt: dataLimite,
        },
      },
    });

    // Marcar como offline
    for (const agente of agentesInativos) {
      await this.marcarComoOffline(agente.id);
    }

    return agentesInativos.map((a) => a.id);
  }

  // ===========================================
  // LISTAR AGENTES DA ORGANIZAÇÃO
  // ===========================================

  async listarPorOrganizacao(organizacaoId: string, usuarioId: string): Promise<RespostaAgente[]> {
    await this.verificarMembro(organizacaoId, usuarioId);

    const agentes = await this.prisma.agente.findMany({
      where: { organizacaoId, ativo: true },
      orderBy: { criadoEm: 'asc' },
    });

    return agentes.map((agente) => this.mapearResposta(agente));
  }

  // ===========================================
  // OBTER AGENTE POR ID
  // ===========================================

  async obterPorId(id: string, organizacaoId: string, usuarioId: string): Promise<RespostaAgente> {
    await this.verificarMembro(organizacaoId, usuarioId);

    const agente = await this.prisma.agente.findFirst({
      where: { id, organizacaoId },
    });

    if (!agente) {
      throw new NotFoundException('Agente não encontrado');
    }

    return this.mapearResposta(agente);
  }

  // ===========================================
  // OBTER AGENTE POR AMBIENTE
  // ===========================================

  async obterPorAmbiente(
    ambienteId: string,
    organizacaoId: string,
  ): Promise<RespostaAgente | null> {
    const agente = await this.prisma.agente.findFirst({
      where: { ambienteId, organizacaoId, ativo: true },
    });

    if (!agente) {
      return null;
    }

    return this.mapearResposta(agente);
  }

  // ===========================================
  // OBTER AGENTE PELO TOKEN (para WebSocket)
  // ===========================================

  async obterPorToken(token: string): Promise<RespostaAgente | null> {
    const agente = await this.prisma.agente.findUnique({
      where: { token },
    });

    if (!agente || !agente.ativo) {
      return null;
    }

    return this.mapearResposta(agente);
  }

  // ===========================================
  // DESATIVAR AGENTE
  // ===========================================

  async desativar(id: string, organizacaoId: string, usuarioId: string): Promise<void> {
    await this.verificarMembro(organizacaoId, usuarioId);

    const agente = await this.prisma.agente.findFirst({
      where: { id, organizacaoId },
    });

    if (!agente) {
      throw new NotFoundException('Agente não encontrado');
    }

    await this.prisma.agente.update({
      where: { id },
      data: { ativo: false, status: 'offline' },
    });
  }

  // ===========================================
  // VERIFICAR MEMBRO
  // ===========================================

  private async verificarMembro(organizacaoId: string, usuarioId: string): Promise<void> {
    const membro = await this.prisma.membroOrganizacao.findUnique({
      where: {
        usuarioId_organizacaoId: {
          usuarioId,
          organizacaoId,
        },
      },
    });

    if (!membro) {
      throw new ForbiddenException('Você não é membro desta organização');
    }
  }

  // ===========================================
  // MAPEAR RESPOSTA
  // ===========================================

  private mapearResposta(agente: any): RespostaAgente {
    return {
      id: agente.id,
      nome: agente.nome,
      status: agente.status,
      ultimoHeartbeat: agente.ultimoHeartbeat,
      versao: agente.versao,
      sistemaOperacional: agente.sistemaOperacional,
      cpuUso: agente.cpuUso,
      memoriaUso: agente.memoriaUso,
      memoriaTotal: agente.memoriaTotal,
      uptime: agente.uptime,
      ambienteId: agente.ambienteId,
      organizacaoId: agente.organizacaoId,
      ativo: agente.ativo,
      criadoEm: agente.criadoEm,
    };
  }
}
