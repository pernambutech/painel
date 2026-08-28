// Controller de ambientes
// Endpoints para CRUD de ambientes

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
import { AmbientesServico } from './ambientes.servico';
import { CriarAmbienteDto, AtualizarAmbienteDto } from './dto/ambiente.dto';
import { JwtAuthGuard } from '../autenticacao/jwt-auth.guard';

@Controller('organizacoes/:organizacaoId/ambientes')
@UseGuards(JwtAuthGuard)
export class AmbientesController {
  constructor(private ambientesServico: AmbientesServico) {}

  // ===========================================
  // CRIAR AMBIENTE
  // ===========================================

  @Post()
  async criar(
    @Param('organizacaoId') organizacaoId: string,
    @Body() dados: CriarAmbienteDto,
    @Request() req,
  ) {
    return this.ambientesServico.criar(dados, organizacaoId, req.user.id);
  }

  // ===========================================
  // LISTAR AMBIENTES
  // ===========================================

  @Get()
  async listar(@Param('organizacaoId') organizacaoId: string, @Request() req) {
    return this.ambientesServico.listarPorOrganizacao(organizacaoId, req.user.id);
  }

  // ===========================================
  // OBTER AMBIENTE POR ID
  // ===========================================

  @Get(':id')
  async obterPorId(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.ambientesServico.obterPorId(id, organizacaoId, req.user.id);
  }

  // ===========================================
  // ATUALIZAR AMBIENTE
  // ===========================================

  @Put(':id')
  async atualizar(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') id: string,
    @Body() dados: AtualizarAmbienteDto,
    @Request() req,
  ) {
    return this.ambientesServico.atualizar(id, dados, organizacaoId, req.user.id);
  }

  // ===========================================
  // REMOVER AMBIENTE
  // ===========================================

  @Delete(':id')
  async remover(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    await this.ambientesServico.remover(id, organizacaoId, req.user.id);

    return { mensagem: 'Ambiente removido com sucesso' };
  }
}
