// Controller de organizações
// Endpoints para criação e consulta de organizações

import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrganizacoesServico } from './organizacoes.servico';
import { CriarOrganizacaoDto } from './dto/organizacao.dto';
import { JwtAuthGuard } from '../autenticacao/jwt-auth.guard';

@Controller('organizacoes')
@UseGuards(JwtAuthGuard)
export class OrganizacoesController {
  constructor(private organizacoesServico: OrganizacoesServico) {}

  // ===========================================
  // CRIAR ORGANIZAÇÃO
  // ===========================================

  @Post()
  async criar(@Body() dados: CriarOrganizacaoDto, @Request() req) {
    return this.organizacoesServico.criar(dados, req.user.id);
  }

  // ===========================================
  // LISTAR ORGANIZAÇÕES DO USUÁRIO
  // ===========================================

  @Get()
  async listar(@Request() req) {
    return this.organizacoesServico.listarPorUsuario(req.user.id);
  }

  // ===========================================
  // OBTER ORGANIZAÇÃO POR ID
  // ===========================================

  @Get(':id')
  async obterPorId(@Param('id') id: string, @Request() req) {
    return this.organizacoesServico.obterPorId(id, req.user.id);
  }
}
