// Controller de agentes
// Endpoints para gestão de agentes, comandos e operações

import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
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
    @Request() req,
  ) {
    return this.agentesServico.obterPorAmbiente(ambienteId, organizacaoId, req.user.id);
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

  // Tipos de comando permitidos via API (somente operações seguras)
  private static readonly COMANDOS_PERMITIDOS: TipoComando[] = [
    'OBTER_INFORMACOES_SISTEMA',
    'OBTER_STATUS',
    'LISTAR_SERVICOS',
    'LISTAR_PORTAS',
    'INICIAR_SERVICO',
    'PARAR_SERVICO',
    'REINICIAR_SERVICO',
    'PM2_SAVE',
    'OBTER_STATUS_SERVICO',
    'OBTER_LOGS_SERVICO',
    'OBTER_TODOS_PROCESSOS',
    'GIT_STATUS',
    'GIT_BRANCH',
    'GIT_PULL',
  ];

  // Limite máximo de timeout em milissegundos (30 segundos)
  private static readonly TIMEOUT_MAXIMO_MS = 30_000;

  @Post(':id/comandos')
  async enviarComando(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') agenteId: string,
    @Body() dados: { tipo: TipoComando; dados?: Record<string, unknown>; timeoutMs?: number },
    @Request() req,
  ) {
    // Verificar se o agente pertence à organização
    await this.agentesServico.obterPorId(agenteId, organizacaoId, req.user.id);

    // Validar tipo de comando — apenas allowlist
    if (!AgentesController.COMANDOS_PERMITIDOS.includes(dados.tipo)) {
      throw new BadRequestException(`Tipo de comando não permitido: ${dados.tipo}`);
    }

    // Limitar timeout para evitar abuso de memória
    const timeoutMs = Math.min(dados.timeoutMs || 10_000, AgentesController.TIMEOUT_MAXIMO_MS);

    return this.comandosServico.enviarEAguardar({
      agenteId,
      tipo: dados.tipo,
      dados: dados.dados,
      timeoutMs,
    });
  }

  @Post(':id/pm2/save')
  async salvarProcessosPm2(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') agenteId: string,
    @Request() req,
  ) {
    await this.agentesServico.obterPorId(agenteId, organizacaoId, req.user.id);

    return this.comandosServico.enviarEAguardar({
      agenteId: agenteId,
      tipo: 'PM2_SAVE',
      timeoutMs: 30_000,
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
