// Controller de agentes
// Endpoints para gestão de agentes, comandos e operações

import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AgentesServico } from './agentes.servico';
import { ComandosServico, TipoComando } from '../comunicacao/comandos.servico';
import { JwtAuthGuard } from '../autenticacao/jwt-auth.guard';

@Controller('organizacoes/:organizacaoId/agentes')
@UseGuards(JwtAuthGuard)
export class AgentesController {
  constructor(
    private agentesServico: AgentesServico,
    private comandosServico: ComandosServico,
  ) {}

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

  // ===========================================
  // ENVIAR COMANDO AO AGENTE
  // ===========================================

  @Post(':id/comandos')
  async enviarComando(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') agenteId: string,
    @Body() dados: { tipo: TipoComando; dados?: Record<string, unknown>; timeoutMs?: number },
    @Request() req,
  ) {
    // Verificar se o agente pertence à organização
    await this.agentesServico.obterPorId(agenteId, organizacaoId, req.user.id);

    return this.comandosServico.enviarEAguardar({
      agenteId,
      tipo: dados.tipo,
      dados: dados.dados,
      timeoutMs: dados.timeoutMs,
    });
  }

  // ===========================================
  // LISTAR COMANDOS DO AGENTE
  // ===========================================

  @Get(':id/comandos')
  async listarComandos(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') agenteId: string,
    @Request() req,
  ) {
    // Verificar se o agente pertence à organização
    await this.agentesServico.obterPorId(agenteId, organizacaoId, req.user.id);

    return this.comandosServico.listarPorAgente(agenteId);
  }

  // ===========================================
  // OBTER STATUS DE UM COMANDO
  // ===========================================

  @Get(':id/comandos/:comandoId')
  async obterComando(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') agenteId: string,
    @Param('comandoId') comandoId: string,
    @Request() req,
  ) {
    // Verificar se o agente pertence à organização
    await this.agentesServico.obterPorId(agenteId, organizacaoId, req.user.id);

    const comando = this.comandosServico.obterComando(comandoId);
    if (!comando || comando.agenteId !== agenteId) {
      return { erro: 'Comando não encontrado' };
    }

    return comando;
  }
}
