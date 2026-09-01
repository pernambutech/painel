// Controller de serviços
// Endpoints para CRUD de serviços vinculados a projetos

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ServicosServico } from './servicos.servico';
import { CriarServicoDto, AtualizarServicoDto } from './dto/servico.dto';
import { JwtAuthGuard } from '../autenticacao/jwt-auth.guard';

@Controller('organizacoes/:organizacaoId')
@UseGuards(JwtAuthGuard)
export class ServicosController {
  constructor(private servicosServico: ServicosServico) {}

  // ===========================================
  // LISTAR TODOS OS SERVIÇOS DA ORGANIZAÇÃO
  // ===========================================

  @Get('servicos')
  async listarTodos(
    @Param('organizacaoId') organizacaoId: string,
    @Request() req,
  ) {
    return this.servicosServico.listarPorOrganizacao(organizacaoId, req.user.id);
  }

  // ===========================================
  // CRIAR SERVIÇO
  // ===========================================

  @Post('projetos/:projetoId/servicos')
  async criar(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Body() dados: CriarServicoDto,
    @Request() req,
  ) {
    return this.servicosServico.criar(dados, projetoId, organizacaoId, req.user.id);
  }

  // ===========================================
  // LISTAR SERVIÇOS DO PROJETO
  // ===========================================

  @Get('projetos/:projetoId/servicos')
  async listarPorProjeto(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Request() req,
  ) {
    return this.servicosServico.listarPorProjeto(projetoId, organizacaoId, req.user.id);
  }

  // ===========================================
  // OBTER SERVIÇO POR ID
  // ===========================================

  @Get('projetos/:projetoId/servicos/:id')
  async obterPorId(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.servicosServico.obterPorId(id, projetoId, organizacaoId, req.user.id);
  }

  // ===========================================
  // ATUALIZAR SERVIÇO
  // ===========================================

  @Put('projetos/:projetoId/servicos/:id')
  async atualizar(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Body() dados: AtualizarServicoDto,
    @Request() req,
  ) {
    return this.servicosServico.atualizar(id, dados, projetoId, organizacaoId, req.user.id);
  }

  // ===========================================
  // REMOVER SERVIÇO
  // ===========================================

  @Delete('projetos/:projetoId/servicos/:id')
  async remover(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    await this.servicosServico.remover(id, projetoId, organizacaoId, req.user.id);

    return { mensagem: 'Serviço removido com sucesso' };
  }

  // ===========================================
  // CONTROLE DE SERVIÇOS (via PM2 no agente)
  // ===========================================

  @Post('projetos/:projetoId/servicos/:id/iniciar')
  async iniciar(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.servicosServico.iniciar(id, projetoId, organizacaoId, req.user.id);
  }

  @Post('projetos/:projetoId/servicos/:id/parar')
  async parar(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.servicosServico.parar(id, projetoId, organizacaoId, req.user.id);
  }

  @Post('projetos/:projetoId/servicos/:id/reiniciar')
  async reiniciar(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.servicosServico.reiniciar(id, projetoId, organizacaoId, req.user.id);
  }

  @Get('projetos/:projetoId/servicos/:id/status')
  async obterStatus(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.servicosServico.obterStatusServico(id, projetoId, organizacaoId, req.user.id);
  }

  @Get('projetos/:projetoId/servicos/:id/logs')
  async obterLogs(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    const linhas = req.query.linhas ? parseInt(req.query.linhas as string, 10) : 100;
    const tipo = (req.query.tipo as string) || 'todos';
    return this.servicosServico.obterLogs(id, projetoId, organizacaoId, req.user.id, {
      linhas,
      tipo,
    });
  }

  // ===========================================
  // OPERAÇÕES GIT (somente operações seguras)
  // ===========================================

  @Get('projetos/:projetoId/servicos/:id/git/status')
  async gitStatus(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.servicosServico.gitStatus(id, projetoId, organizacaoId, req.user.id);
  }

  @Get('projetos/:projetoId/servicos/:id/git/branch')
  async gitBranch(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.servicosServico.gitBranch(id, projetoId, organizacaoId, req.user.id);
  }

  @Post('projetos/:projetoId/servicos/:id/git/pull')
  async gitPull(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Body() dados: { remoto?: string; branch?: string },
    @Request() req,
  ) {
    return this.servicosServico.gitPull(id, projetoId, organizacaoId, req.user.id, dados);
  }

  @Get('projetos/:projetoId/servicos/:id/git/log')
  async gitLog(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    const limite = req.query.limite ? parseInt(req.query.limite as string, 10) : 50;
    return this.servicosServico.gitLog(id, projetoId, organizacaoId, req.user.id, limite);
  }

  @Post('projetos/:projetoId/servicos/:id/git/checkout')
  async gitCheckout(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Body() dados: { hash: string },
    @Request() req,
  ) {
    return this.servicosServico.gitCheckout(id, projetoId, organizacaoId, req.user.id, dados.hash);
  }

  @Post('projetos/:projetoId/servicos/:id/git/checkout-branch')
  async gitCheckoutBranch(
    @Param('organizacaoId') organizacaoId: string,
    @Param('projetoId') projetoId: string,
    @Param('id') id: string,
    @Body() dados: { branch: string },
    @Request() req,
  ) {
    return this.servicosServico.gitCheckoutBranch(id, projetoId, organizacaoId, req.user.id, dados.branch);
  }

  // ===========================================
  // DASHBOARD — DADOS CONSOLIDADOS
  // ===========================================

  @Get('dashboard')
  async obterDashboard(
    @Param('organizacaoId') organizacaoId: string,
    @Request() req,
  ) {
    return this.servicosServico.obterDadosDashboard(organizacaoId, req.user.id);
  }
}
