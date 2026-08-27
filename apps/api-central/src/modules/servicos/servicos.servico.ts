// Serviço de serviços
// Gerencia criação, listagem, edição e remoção de serviços vinculados a projetos

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaServico } from '../database/prisma.servico';
import {
  CriarServicoDto,
  AtualizarServicoDto,
  RespostaServico,
} from './dto/servico.dto';

@Injectable()
export class ServicosServico {
  constructor(private prisma: PrismaServico) {}

  // ===========================================
  // CRIAR SERVIÇO
  // ===========================================

  async criar(
    dados: CriarServicoDto,
    projetoId: string,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<RespostaServico> {
    await this.verificarMembro(organizacaoId, usuarioId);
    await this.verificarProjeto(projetoId, organizacaoId);

    if (dados.ambienteId) {
      await this.verificarAmbiente(dados.ambienteId, organizacaoId);
    }

    if (dados.porta !== undefined && dados.porta !== null) {
      this.validarPorta(dados.porta);
    }

    const servico = await this.prisma.servico.create({
      data: {
        nome: dados.nome,
        tipo: dados.tipo || 'custom',
        diretorio: dados.diretorio || null,
        comando: dados.comando || null,
        porta: dados.porta ?? null,
        projetoId,
        ambienteId: dados.ambienteId || null,
        organizacaoId,
      },
      include: {
        ambiente: {
          select: { id: true, nome: true, tipo: true },
        },
      },
    });

    return this.mapearResposta(servico);
  }

  // ===========================================
  // LISTAR SERVIÇOS DO PROJETO
  // ===========================================

  async listarPorProjeto(
    projetoId: string,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<RespostaServico[]> {
    await this.verificarMembro(organizacaoId, usuarioId);
    await this.verificarProjeto(projetoId, organizacaoId);

    const servicos = await this.prisma.servico.findMany({
      where: {
        projetoId,
        organizacaoId,
        ativo: true,
      },
      include: {
        ambiente: {
          select: { id: true, nome: true, tipo: true },
        },
      },
      orderBy: { criadoEm: 'asc' },
    });

    return servicos.map((s) => this.mapearResposta(s));
  }

  // ===========================================
  // LISTAR TODOS OS SERVIÇOS DA ORGANIZAÇÃO
  // ===========================================

  async listarPorOrganizacao(
    organizacaoId: string,
    usuarioId: string,
  ): Promise<RespostaServico[]> {
    await this.verificarMembro(organizacaoId, usuarioId);

    const servicos = await this.prisma.servico.findMany({
      where: {
        organizacaoId,
        ativo: true,
      },
      include: {
        ambiente: {
          select: { id: true, nome: true, tipo: true },
        },
      },
      orderBy: { criadoEm: 'asc' },
    });

    return servicos.map((s) => this.mapearResposta(s));
  }

  // ===========================================
  // OBTER SERVIÇO POR ID
  // ===========================================

  async obterPorId(
    id: string,
    projetoId: string,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<RespostaServico> {
    await this.verificarMembro(organizacaoId, usuarioId);
    await this.verificarProjeto(projetoId, organizacaoId);

    const servico = await this.prisma.servico.findFirst({
      where: {
        id,
        projetoId,
        organizacaoId,
      },
      include: {
        ambiente: {
          select: { id: true, nome: true, tipo: true },
        },
      },
    });

    if (!servico) {
      throw new NotFoundException('Serviço não encontrado');
    }

    return this.mapearResposta(servico);
  }

  // ===========================================
  // ATUALIZAR SERVIÇO
  // ===========================================

  async atualizar(
    id: string,
    dados: AtualizarServicoDto,
    projetoId: string,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<RespostaServico> {
    await this.verificarMembro(organizacaoId, usuarioId);
    await this.verificarProjeto(projetoId, organizacaoId);

    const existente = await this.prisma.servico.findFirst({
      where: { id, projetoId, organizacaoId },
    });

    if (!existente) {
      throw new NotFoundException('Serviço não encontrado');
    }

    if (dados.ambienteId !== undefined) {
      if (dados.ambienteId) {
        await this.verificarAmbiente(dados.ambienteId, organizacaoId);
      }
    }

    if (dados.porta !== undefined && dados.porta !== null) {
      this.validarPorta(dados.porta);
    }

    const servico = await this.prisma.servico.update({
      where: { id },
      data: {
        ...(dados.nome !== undefined && { nome: dados.nome }),
        ...(dados.tipo !== undefined && { tipo: dados.tipo }),
        ...(dados.diretorio !== undefined && { diretorio: dados.diretorio }),
        ...(dados.comando !== undefined && { comando: dados.comando }),
        ...(dados.porta !== undefined && { porta: dados.porta }),
        ...(dados.ambienteId !== undefined && { ambienteId: dados.ambienteId }),
      },
      include: {
        ambiente: {
          select: { id: true, nome: true, tipo: true },
        },
      },
    });

    return this.mapearResposta(servico);
  }

  // ===========================================
  // REMOVER SERVIÇO
  // ===========================================

  async remover(
    id: string,
    projetoId: string,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<void> {
    await this.verificarMembro(organizacaoId, usuarioId);
    await this.verificarProjeto(projetoId, organizacaoId);

    const existente = await this.prisma.servico.findFirst({
      where: { id, projetoId, organizacaoId },
    });

    if (!existente) {
      throw new NotFoundException('Serviço não encontrado');
    }

    await this.prisma.servico.delete({
      where: { id },
    });
  }

  // ===========================================
  // VERIFICAÇÕES
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

  private async verificarProjeto(projetoId: string, organizacaoId: string): Promise<void> {
    const projeto = await this.prisma.projeto.findFirst({
      where: { id: projetoId, organizacaoId },
    });

    if (!projeto) {
      throw new NotFoundException('Projeto não encontrado');
    }
  }

  private async verificarAmbiente(ambienteId: string, organizacaoId: string): Promise<void> {
    const ambiente = await this.prisma.ambiente.findFirst({
      where: { id: ambienteId, organizacaoId },
    });

    if (!ambiente) {
      throw new NotFoundException('Ambiente não encontrado');
    }
  }

  private validarPorta(porta: number): void {
    if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
      throw new BadRequestException('Porta deve ser um número entre 1 e 65535');
    }
  }

  // ===========================================
  // MAPEAR RESPOSTA
  // ===========================================

  private mapearResposta(servico: any): RespostaServico {
    return {
      id: servico.id,
      nome: servico.nome,
      tipo: servico.tipo,
      diretorio: servico.diretorio,
      comando: servico.comando,
      porta: servico.porta,
      projetoId: servico.projetoId,
      ambienteId: servico.ambienteId,
      organizacaoId: servico.organizacaoId,
      ativo: servico.ativo,
      criadoEm: servico.criadoEm,
      atualizadoEm: servico.atualizadoEm,
      ambiente: servico.ambiente || null,
    };
  }
}
