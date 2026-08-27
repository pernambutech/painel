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
import type { CriarServicoDto, AtualizarServicoDto } from './dto/servico.dto';
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
}
