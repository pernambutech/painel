// Serviço de ambientes
// Gerencia criação, listagem e consulta de ambientes

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaServico } from '../database/prisma.servico';
import { CriarAmbienteDto, AtualizarAmbienteDto, RespostaAmbiente } from './dto/ambiente.dto';

@Injectable()
export class AmbientesServico {
  constructor(private prisma: PrismaServico) {}

  // ===========================================
  // CRIAR AMBIENTE
  // ===========================================

  async criar(
    dados: CriarAmbienteDto,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<RespostaAmbiente> {
    // Verificar se o usuário é membro da organização
    await this.verificarMembro(organizacaoId, usuarioId);

    const ambiente = await this.prisma.ambiente.create({
      data: {
        nome: dados.nome,
        tipo: dados.tipo || 'local',
        sistemaOperacional: dados.sistemaOperacional || 'linux',
        organizacaoId,
      },
    });

    return this.mapearResposta(ambiente);
  }

  // ===========================================
  // LISTAR AMBIENTES DA ORGANIZAÇÃO
  // ===========================================

  async listarPorOrganizacao(
    organizacaoId: string,
    usuarioId: string,
  ): Promise<RespostaAmbiente[]> {
    // Verificar se o usuário é membro da organização
    await this.verificarMembro(organizacaoId, usuarioId);

    const ambientes = await this.prisma.ambiente.findMany({
      where: { organizacaoId },
      orderBy: { criadoEm: 'asc' },
    });

    return ambientes.map((ambiente) => this.mapearResposta(ambiente));
  }

  // ===========================================
  // OBTER AMBIENTE POR ID
  // ===========================================

  async obterPorId(
    id: string,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<RespostaAmbiente> {
    // Verificar se o usuário é membro da organização
    await this.verificarMembro(organizacaoId, usuarioId);

    const ambiente = await this.prisma.ambiente.findFirst({
      where: {
        id,
        organizacaoId,
      },
    });

    if (!ambiente) {
      throw new NotFoundException('Ambiente não encontrado');
    }

    return this.mapearResposta(ambiente);
  }

  // ===========================================
  // ATUALIZAR AMBIENTE
  // ===========================================

  async atualizar(
    id: string,
    dados: AtualizarAmbienteDto,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<RespostaAmbiente> {
    // Verificar se o usuário é membro da organização
    await this.verificarMembro(organizacaoId, usuarioId);

    // Verificar se o ambiente existe
    const ambienteExistente = await this.prisma.ambiente.findFirst({
      where: {
        id,
        organizacaoId,
      },
    });

    if (!ambienteExistente) {
      throw new NotFoundException('Ambiente não encontrado');
    }

    const ambiente = await this.prisma.ambiente.update({
      where: { id },
      data: {
        ...(dados.nome && { nome: dados.nome }),
        ...(dados.tipo && { tipo: dados.tipo }),
        ...(dados.sistemaOperacional && {
          sistemaOperacional: dados.sistemaOperacional,
        }),
      },
    });

    return this.mapearResposta(ambiente);
  }

  // ===========================================
  // REMOVER AMBIENTE
  // ===========================================

  async remover(id: string, organizacaoId: string, usuarioId: string): Promise<void> {
    // Verificar se o usuário é membro da organização
    await this.verificarMembro(organizacaoId, usuarioId);

    // Verificar se o ambiente existe
    const ambienteExistente = await this.prisma.ambiente.findFirst({
      where: {
        id,
        organizacaoId,
      },
    });

    if (!ambienteExistente) {
      throw new NotFoundException('Ambiente não encontrado');
    }

    await this.prisma.ambiente.delete({
      where: { id },
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

  private mapearResposta(ambiente: any): RespostaAmbiente {
    return {
      id: ambiente.id,
      nome: ambiente.nome,
      tipo: ambiente.tipo,
      sistemaOperacional: ambiente.sistemaOperacional,
      organizacaoId: ambiente.organizacaoId,
      ativo: ambiente.ativo,
      criadoEm: ambiente.criadoEm,
    };
  }
}
