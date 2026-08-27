// Serviço de serviços
// Gerencia criação, listagem, edição e remoção de serviços vinculados a projetos

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaServico } from '../database/prisma.servico';
import {
  CriarServicoDto,
  AtualizarServicoDto,
  RespostaServico,
} from './dto/servico.dto';
import { ComandosServico } from '../comunicacao/comandos.servico';
import { ExecucoesServico } from '../execucoes/execucoes.servico';

@Injectable()
export class ServicosServico {
  constructor(
    private prisma: PrismaServico,
    @Inject(forwardRef(() => ComandosServico))
    private comandosServico: ComandosServico,
    private execucoesServico: ExecucoesServico,
  ) {}

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
  // CONTROLE DE SERVIÇOS (via agente + PM2)
  // ===========================================

  async iniciar(
    id: string,
    projetoId: string,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<Record<string, unknown>> {
    const { servico, agente } = await this.obterServicoEAgente(
      id,
      projetoId,
      organizacaoId,
      usuarioId,
    );

    if (!servico.diretorio || !servico.comando) {
      throw new BadRequestException('Serviço sem diretório ou comando configurado');
    }

    // Criar registro de execução (histórico)
    const execucao = await this.execucoesServico.criar({
      organizacaoId,
      projetoId,
      servicoId: servico.id,
      ambienteId: servico.ambienteId,
      acao: 'iniciar',
      usuarioId,
    });

    try {
      const comando = await this.comandosServico.enviarEAguardar({
        agenteId: agente.id,
        tipo: 'INICIAR_SERVICO',
        dados: {
          servicoId: servico.id,
          configuracao: {
            id: servico.id,
            nome: servico.nome,
            diretorio: servico.diretorio,
            comando: servico.comando,
            porta: servico.porta ?? undefined,
            nomePm2: servico.id,
          },
        },
      });

      await this.execucoesServico.atualizar(execucao.id, {
        status: 'sucesso',
        resultado: comando.resultado as Record<string, unknown>,
      });

      return (comando.resultado as Record<string, unknown>) || { mensagem: 'Serviço iniciado' };
    } catch (erro: any) {
      await this.execucoesServico.atualizar(execucao.id, {
        status: 'falhou',
        erro: erro.message,
      });
      throw erro;
    }
  }

  async parar(
    id: string,
    projetoId: string,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<Record<string, unknown>> {
    const { servico, agente } = await this.obterServicoEAgente(
      id,
      projetoId,
      organizacaoId,
      usuarioId,
    );

    const execucao = await this.execucoesServico.criar({
      organizacaoId,
      projetoId,
      servicoId: servico.id,
      ambienteId: servico.ambienteId,
      acao: 'parar',
      usuarioId,
    });

    try {
      const comando = await this.comandosServico.enviarEAguardar({
        agenteId: agente.id,
        tipo: 'PARAR_SERVICO',
        dados: { servicoId: servico.id },
      });

      await this.execucoesServico.atualizar(execucao.id, {
        status: 'sucesso',
        resultado: comando.resultado as Record<string, unknown>,
      });

      return (comando.resultado as Record<string, unknown>) || { mensagem: 'Serviço parado' };
    } catch (erro: any) {
      await this.execucoesServico.atualizar(execucao.id, {
        status: 'falhou',
        erro: erro.message,
      });
      throw erro;
    }
  }

  async reiniciar(
    id: string,
    projetoId: string,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<Record<string, unknown>> {
    const { servico, agente } = await this.obterServicoEAgente(
      id,
      projetoId,
      organizacaoId,
      usuarioId,
    );

    const execucao = await this.execucoesServico.criar({
      organizacaoId,
      projetoId,
      servicoId: servico.id,
      ambienteId: servico.ambienteId,
      acao: 'reiniciar',
      usuarioId,
    });

    try {
      const comando = await this.comandosServico.enviarEAguardar({
        agenteId: agente.id,
        tipo: 'REINICIAR_SERVICO',
        dados: { servicoId: servico.id },
      });

      await this.execucoesServico.atualizar(execucao.id, {
        status: 'sucesso',
        resultado: comando.resultado as Record<string, unknown>,
      });

      return (comando.resultado as Record<string, unknown>) || { mensagem: 'Serviço reiniciado' };
    } catch (erro: any) {
      await this.execucoesServico.atualizar(execucao.id, {
        status: 'falhou',
        erro: erro.message,
      });
      throw erro;
    }
  }

  async obterStatusServico(
    id: string,
    projetoId: string,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<Record<string, unknown>> {
    const { servico, agente } = await this.obterServicoEAgente(
      id,
      projetoId,
      organizacaoId,
      usuarioId,
    );

    const comando = await this.comandosServico.enviarEAguardar({
      agenteId: agente.id,
      tipo: 'OBTER_STATUS_SERVICO',
      dados: { servicoId: servico.id },
    });

    return (comando.resultado as Record<string, unknown>) || { status: 'desconhecido' };
  }

  private async obterServicoEAgente(
    id: string,
    projetoId: string,
    organizacaoId: string,
    usuarioId: string,
  ): Promise<{ servico: RespostaServico & { diretorio: string | null; comando: string | null }; agente: { id: string } }> {
    await this.verificarMembro(organizacaoId, usuarioId);
    await this.verificarProjeto(projetoId, organizacaoId);

    const servico = await this.prisma.servico.findFirst({
      where: { id, projetoId, organizacaoId },
    });

    if (!servico) {
      throw new NotFoundException('Serviço não encontrado');
    }

    if (!servico.ambienteId) {
      throw new BadRequestException('Serviço sem ambiente associado');
    }

    const agente = await this.prisma.agente.findFirst({
      where: {
        ambienteId: servico.ambienteId,
        organizacaoId,
        ativo: true,
      },
    });

    if (!agente) {
      throw new NotFoundException('Nenhum agente encontrado para o ambiente do serviço');
    }

    return { servico: servico as any, agente };
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
