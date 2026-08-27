// Controller de agentes
// Endpoints para gestão de agentes (token, listagem, consulta)

import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { AgentesServico } from './agentes.servico';
import { JwtAuthGuard } from '../autenticacao/jwt-auth.guard';

@Controller('organizacoes/:organizacaoId/agentes')
@UseGuards(JwtAuthGuard)
export class AgentesController {
  constructor(private agentesServico: AgentesServico) {}

  // ===========================================
  // GERAR TOKEN PARA AMBIENTE
  // ===========================================

  @Post('ambiente/:ambienteId/token')
  async gerarToken(
    @Param('organizacaoId') organizacaoId: string,
    @Param('ambienteId') ambienteId: string,
    @Request() req,
  ) {
    return this.agentesServico.gerarToken(ambienteId, organizacaoId, req.user.id);
  }

  // ===========================================
  // LISTAR AGENTES
  // ===========================================

  @Get()
  async listar(@Param('organizacaoId') organizacaoId: string, @Request() req) {
    return this.agentesServico.listarPorOrganizacao(organizacaoId, req.user.id);
  }

  // ===========================================
  // OBTER AGENTE POR ID
  // ===========================================

  @Get(':id')
  async obterPorId(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.agentesServico.obterPorId(id, organizacaoId, req.user.id);
  }

  // ===========================================
  // OBTER AGENTE POR AMBIENTE
  // ===========================================

  @Get('ambiente/:ambienteId')
  async obterPorAmbiente(
    @Param('organizacaoId') organizacaoId: string,
    @Param('ambienteId') ambienteId: string,
  ) {
    return this.agentesServico.obterPorAmbiente(ambienteId, organizacaoId);
  }

  // ===========================================
  // DESATIVAR AGENTE
  // ===========================================

  @Delete(':id')
  async desativar(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    await this.agentesServico.desativar(id, organizacaoId, req.user.id);
    return { mensagem: 'Agente desativado com sucesso' };
  }
}
