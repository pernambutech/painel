// Serviço de execuções / histórico
// Registra e consulta execuções de ações em serviços

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaServico } from '../database/prisma.servico';
import { RespostaExecucao } from './dto/execucao.dto';

@Injectable()
export class ExecucoesServico {
  constructor(private prisma: PrismaServico) {}

  // ===========================================
  // CRIAR EXECUÇÃO
  // ===========================================

  async criar(dados: {
    organizacaoId: string;
    projetoId?: string | null;
    servicoId: string;
    ambienteId?: string | null;
    acao: string;
    usuarioId: string;
  }): Promise<RespostaExecucao> {
    const execucao = await this.prisma.execucao.create({
      data: {
        organizacaoId: dados.organizacaoId,
        projetoId: dados.projetoId || null,
        servicoId: dados.servicoId,
        ambienteId: dados.ambienteId || null,
        acao: dados.acao,
        status: 'pendente',
        usuarioId: dados.usuarioId,
      },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        servico: { select: { id: true, nome: true, tipo: true } },
        projeto: { select: { id: true, nome: true } },
        ambiente: { select: { id: true, nome: true } },
      },
    });

    return this.mapearResposta(execucao);
  }

  // ===========================================
  // ATUALIZAR EXECUÇÃO (após comando)
  // ===========================================

  async atualizar(
    id: string,
    dados: { status: string; resultado?: Record<string, unknown>; erro?: string },
  ): Promise<RespostaExecucao> {
    const execucao = await this.prisma.execucao.update({
      where: { id },
      data: {
        status: dados.status,
        resultado: dados.resultado as any,
        erro: dados.erro || null,
      },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        servico: { select: { id: true, nome: true, tipo: true } },
        projeto: { select: { id: true, nome: true } },
        ambiente: { select: { id: true, nome: true } },
      },
    });

    return this.mapearResposta(execucao);
  }

  // ===========================================
  // LISTAR POR ORGANIZAÇÃO
  // ===========================================

  async listarPorOrganizacao(
    organizacaoId: string,
    usuarioId: string,
    limite = 20,
    pagina = 1,
  ): Promise<{ dados: RespostaExecucao[]; total: number; paginas: number }> {
    await this.verificarMembro(organizacaoId, usuarioId);

    const skip = (pagina - 1) * limite;

    const [execucoes, total] = await Promise.all([
      this.prisma.execucao.findMany({
        where: { organizacaoId },
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
          servico: { select: { id: true, nome: true, tipo: true } },
          projeto: { select: { id: true, nome: true } },
          ambiente: { select: { id: true, nome: true } },
        },
        orderBy: { criadoEm: 'desc' },
        take: limite,
        skip,
      }),
      this.prisma.execucao.count({ where: { organizacaoId } }),
    ]);

    return {
      dados: execucoes.map((e) => this.mapearResposta(e)),
      total,
      paginas: Math.ceil(total / limite),
    };
  }

  // ===========================================
  // LISTAR POR SERVIÇO
  // ===========================================

  async listarPorServico(
    servicoId: string,
    organizacaoId: string,
    usuarioId: string,
    limite = 20,
  ): Promise<RespostaExecucao[]> {
    await this.verificarMembro(organizacaoId, usuarioId);

    const execucoes = await this.prisma.execucao.findMany({
      where: { servicoId, organizacaoId },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        servico: { select: { id: true, nome: true, tipo: true } },
        projeto: { select: { id: true, nome: true } },
        ambiente: { select: { id: true, nome: true } },
      },
      orderBy: { criadoEm: 'desc' },
      take: limite,
    });

    return execucoes.map((e) => this.mapearResposta(e));
  }

  // ===========================================
  // OBTER POR ID
  // ===========================================

  async obterPorId(id: string, organizacaoId: string, usuarioId: string): Promise<RespostaExecucao> {
    await this.verificarMembro(organizacaoId, usuarioId);

    const execucao = await this.prisma.execucao.findFirst({
      where: { id, organizacaoId },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        servico: { select: { id: true, nome: true, tipo: true } },
        projeto: { select: { id: true, nome: true } },
        ambiente: { select: { id: true, nome: true } },
      },
    });

    if (!execucao) {
      throw new NotFoundException('Execução não encontrada');
    }

    return this.mapearResposta(execucao);
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

  private mapearResposta(execucao: any): RespostaExecucao {
    return {
      id: execucao.id,
      organizacaoId: execucao.organizacaoId,
      projetoId: execucao.projetoId,
      servicoId: execucao.servicoId,
      ambienteId: execucao.ambienteId,
      acao: execucao.acao,
      status: execucao.status,
      resultado: execucao.resultado,
      erro: execucao.erro,
      usuarioId: execucao.usuarioId,
      criadoEm: execucao.criadoEm,
      atualizadoEm: execucao.atualizadoEm,
      usuario: execucao.usuario || undefined,
      servico: execucao.servico || undefined,
      projeto: execucao.projeto || null,
      ambiente: execucao.ambiente || null,
    };
  }
}
