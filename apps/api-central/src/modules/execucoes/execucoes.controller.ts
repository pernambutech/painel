// Controller de execuções / histórico

import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ExecucoesServico } from './execucoes.servico';
import { JwtAuthGuard } from '../autenticacao/jwt-auth.guard';

@Controller('organizacoes/:organizacaoId')
@UseGuards(JwtAuthGuard)
export class ExecucoesController {
  constructor(private execucoesServico: ExecucoesServico) {}

  // ===========================================
  // LISTAR HISTÓRICO DA ORGANIZAÇÃO
  // ===========================================

  @Get('execucoes')
  async listarPorOrganizacao(
    @Param('organizacaoId') organizacaoId: string,
    @Query('limite') limite: string,
    @Request() req,
  ) {
    const lim = Math.min(Math.max(parseInt(limite, 10) || 50, 1), 100);
    return this.execucoesServico.listarPorOrganizacao(organizacaoId, req.user.id, lim);
  }

  // ===========================================
  // LISTAR HISTÓRICO DE UM SERVIÇO
  // ===========================================

  @Get('projetos/:projetoId/servicos/:servicoId/execucoes')
  async listarPorServico(
    @Param('organizacaoId') organizacaoId: string,
    @Param('servicoId') servicoId: string,
    @Query('limite') limite: string,
    @Request() req,
  ) {
    const lim = Math.min(Math.max(parseInt(limite, 10) || 20, 1), 100);
    return this.execucoesServico.listarPorServico(servicoId, organizacaoId, req.user.id, lim);
  }

  // ===========================================
  // OBTER EXECUÇÃO POR ID
  // ===========================================

  @Get('execucoes/:id')
  async obterPorId(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.execucoesServico.obterPorId(id, organizacaoId, req.user.id);
  }
}
