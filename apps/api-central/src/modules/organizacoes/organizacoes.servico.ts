// Serviço de organizações
// Gerencia criação, listagem e contexto de organizações

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaServico } from '../database/prisma.servico';
import { AtualizarOrganizacaoDto, CriarOrganizacaoDto, RespostaOrganizacao } from './dto/organizacao.dto';

@Injectable()
export class OrganizacoesServico {
  constructor(private prisma: PrismaServico) {}

  // ===========================================
  // CRIAR ORGANIZAÇÃO
  // ===========================================

  async criar(dados: CriarOrganizacaoDto, usuarioId: string): Promise<RespostaOrganizacao> {
    // Gerar slug a partir do nome
    const slug = this.gerarSlug(dados.nome);

    // Criar organização e membro em uma transação
    const organizacao = await this.prisma.$transaction(async (tx) => {
      // Criar organização
      const org = await tx.organizacao.create({
        data: {
          nome: dados.nome,
          slug,
        },
      });

      // Adicionar usuário como proprietário
      await tx.membroOrganizacao.create({
        data: {
          usuarioId,
          organizacaoId: org.id,
          papel: 'proprietario',
        },
      });

      return org;
    });

    return {
      id: organizacao.id,
      nome: organizacao.nome,
      slug: organizacao.slug,
      papel: 'proprietario',
      criadoEm: organizacao.criadoEm,
    };
  }

  // ===========================================
  // LISTAR ORGANIZAÇÕES DO USUÁRIO
  // ===========================================

  async listarPorUsuario(usuarioId: string): Promise<RespostaOrganizacao[]> {
    const membros = await this.prisma.membroOrganizacao.findMany({
      where: { usuarioId },
      include: {
        organizacao: true,
      },
      orderBy: {
        criadoEm: 'asc',
      },
    });

    return membros.map((membro) => ({
      id: membro.organizacao.id,
      nome: membro.organizacao.nome,
      slug: membro.organizacao.slug,
      papel: membro.papel,
      criadoEm: membro.organizacao.criadoEm,
    }));
  }

  // ===========================================
  // OBTER ORGANIZAÇÃO POR ID
  // ===========================================

  async obterPorId(id: string, usuarioId: string): Promise<RespostaOrganizacao> {
    const membro = await this.prisma.membroOrganizacao.findUnique({
      where: {
        usuarioId_organizacaoId: {
          usuarioId,
          organizacaoId: id,
        },
      },
      include: {
        organizacao: true,
      },
    });

    if (!membro) {
      throw new NotFoundException('Organização não encontrada');
    }

    return {
      id: membro.organizacao.id,
      nome: membro.organizacao.nome,
      slug: membro.organizacao.slug,
      papel: membro.papel,
      criadoEm: membro.organizacao.criadoEm,
    };
  }

  async atualizar(id: string, dados: AtualizarOrganizacaoDto, usuarioId: string): Promise<RespostaOrganizacao> {
    const membro = await this.prisma.membroOrganizacao.findUnique({ where: { usuarioId_organizacaoId: { usuarioId, organizacaoId: id } } });
    if (!membro) throw new ForbiddenException('Você não é membro desta organização');
    if (!['proprietario', 'admin'].includes(membro.papel)) throw new ForbiddenException('Sem permissão para alterar esta organização');
    const organizacao = await this.prisma.organizacao.update({ where: { id }, data: { ...(dados.nome !== undefined && { nome: dados.nome }) } });
    return { id: organizacao.id, nome: organizacao.nome, slug: organizacao.slug, papel: membro.papel, criadoEm: organizacao.criadoEm };
  }

  // ===========================================
  // VERIFICAR SE USUÁRIO É MEMBRO
  // ===========================================

  async verificarMembro(organizacaoId: string, usuarioId: string): Promise<boolean> {
    const membro = await this.prisma.membroOrganizacao.findUnique({
      where: {
        usuarioId_organizacaoId: {
          usuarioId,
          organizacaoId,
        },
      },
    });

    return !!membro;
  }

  // ===========================================
  // OBTER PAPEL DO USUÁRIO
  // ===========================================

  async obterPapel(organizacaoId: string, usuarioId: string): Promise<string | null> {
    const membro = await this.prisma.membroOrganizacao.findUnique({
      where: {
        usuarioId_organizacaoId: {
          usuarioId,
          organizacaoId,
        },
      },
      select: {
        papel: true,
      },
    });

    return membro?.papel || null;
  }

  // ===========================================
  // GERAR SLUG
  // ===========================================

  private gerarSlug(nome: string): string {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
