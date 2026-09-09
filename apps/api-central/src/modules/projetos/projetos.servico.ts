// Serviço de projetos
// Gerencia criação, listagem, consulta, edição e arquivamento de projetos

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaServico } from '../database/prisma.servico';
import { CriarProjetoDto, AtualizarProjetoDto, RespostaProjeto, RespostaListagemProjeto } from './dto/projeto.dto';

@Injectable()
export class ProjetosServico {
  constructor(private prisma: PrismaServico) {}

  // ===========================================
  // CRIAR PROJETO
  // ===========================================

  async criar(
    dados: CriarProjetoDto,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<RespostaProjeto> {
    // Verificar se o usuário é membro da organização
    await this.verificarMembro(organizacaoId, usuarioId);

    const projeto = await this.prisma.projeto.create({
      data: {
        nome: dados.nome,
        descricao: dados.descricao || null,
        organizacaoId,
      },
    });

    return this.mapearResposta(projeto);
  }

  // ===========================================
  // LISTAR PROJETOS DA ORGANIZAÇÃO
  // ===========================================

  async listarPorOrganizacao(
    organizacaoId: string,
    usuarioId: string,
    incluirArquivados = false,
  ): Promise<RespostaProjeto[]> {
    // Verificar se o usuário é membro da organização
    await this.verificarMembro(organizacaoId, usuarioId);

    const projetos = await this.prisma.projeto.findMany({
      where: {
        organizacaoId,
        ...(incluirArquivados ? {} : { ativo: true }),
      },
      orderBy: { criadoEm: 'asc' },
      // Conta os serviços (ativos) de cada projeto para exibição nos cards
      select: {
        id: true,
        nome: true,
        descricao: true,
        organizacaoId: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true,
        _count: { select: { servicos: { where: { ativo: true } } } },
      },
    });

    return projetos.map((projeto) =>
      this.mapearListagem({
        id: projeto.id,
        nome: projeto.nome,
        descricao: projeto.descricao,
        organizacaoId: projeto.organizacaoId,
        ativo: projeto.ativo,
        criadoEm: projeto.criadoEm,
        atualizadoEm: projeto.atualizadoEm,
        totalServicos: projeto._count.servicos,
      }),
    );
  }

  // ===========================================
  // OBTER PROJETO POR ID
  // ===========================================

  async obterPorId(
    id: string,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<RespostaProjeto> {
    // Verificar se o usuário é membro da organização
    await this.verificarMembro(organizacaoId, usuarioId);

    const projeto = await this.prisma.projeto.findFirst({
      where: {
        id,
        organizacaoId,
      },
    });

    if (!projeto) {
      throw new NotFoundException('Projeto não encontrado');
    }

    return this.mapearResposta(projeto);
  }

  // ===========================================
  // ATUALIZAR PROJETO
  // ===========================================

  async atualizar(
    id: string,
    dados: AtualizarProjetoDto,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<RespostaProjeto> {
    // Verificar se o usuário é membro da organização
    await this.verificarMembro(organizacaoId, usuarioId);

    // Verificar se o projeto existe
    const projetoExistente = await this.prisma.projeto.findFirst({
      where: {
        id,
        organizacaoId,
      },
    });

    if (!projetoExistente) {
      throw new NotFoundException('Projeto não encontrado');
    }

    const projeto = await this.prisma.projeto.update({
      where: { id },
      data: {
        ...(dados.nome !== undefined && { nome: dados.nome }),
        ...(dados.descricao !== undefined && { descricao: dados.descricao }),
      },
    });

    return this.mapearResposta(projeto);
  }

  // ===========================================
  // ARQUIVAR PROJETO
  // ===========================================

  async arquivar(id: string, organizacaoId: string, usuarioId: string): Promise<RespostaProjeto> {
    // Verificar se o usuário é membro da organização
    await this.verificarMembro(organizacaoId, usuarioId);

    // Verificar se o projeto existe
    const projetoExistente = await this.prisma.projeto.findFirst({
      where: {
        id,
        organizacaoId,
      },
    });

    if (!projetoExistente) {
      throw new NotFoundException('Projeto não encontrado');
    }

    const projeto = await this.prisma.projeto.update({
      where: { id },
      data: {
        ativo: false,
        deletadoEm: new Date(),
      },
    });

    return this.mapearResposta(projeto);
  }

  // ===========================================
  // REATIVAR PROJETO
  // ===========================================

  async reativar(id: string, organizacaoId: string, usuarioId: string): Promise<RespostaProjeto> {
    // Verificar se o usuário é membro da organização
    await this.verificarMembro(organizacaoId, usuarioId);

    // Verificar se o projeto existe
    const projetoExistente = await this.prisma.projeto.findFirst({
      where: {
        id,
        organizacaoId,
      },
    });

    if (!projetoExistente) {
      throw new NotFoundException('Projeto não encontrado');
    }

    const projeto = await this.prisma.projeto.update({
      where: { id },
      data: {
        ativo: true,
        deletadoEm: null,
      },
    });

    return this.mapearResposta(projeto);
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

  private mapearResposta(projeto: any): RespostaProjeto {
    return {
      id: projeto.id,
      nome: projeto.nome,
      descricao: projeto.descricao,
      organizacaoId: projeto.organizacaoId,
      ativo: projeto.ativo,
      deletadoEm: projeto.deletadoEm || null,
      criadoEm: projeto.criadoEm,
      atualizadoEm: projeto.atualizadoEm,
    };
  }

  // Resposta da listagem: inclui a contagem de serviços ativos do projeto
  private mapearListagem(projeto: any): RespostaListagemProjeto {
    return {
      id: projeto.id,
      nome: projeto.nome,
      descricao: projeto.descricao,
      organizacaoId: projeto.organizacaoId,
      ativo: projeto.ativo,
      deletadoEm: projeto.deletadoEm || null,
      criadoEm: projeto.criadoEm,
      atualizadoEm: projeto.atualizadoEm,
      totalServicos: projeto.totalServicos,
    };
  }
}