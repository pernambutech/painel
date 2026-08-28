// Controller de projetos
// Endpoints para CRUD de projetos

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjetosServico } from './projetos.servico';
import { CriarProjetoDto, AtualizarProjetoDto } from './dto/projeto.dto';
import { JwtAuthGuard } from '../autenticacao/jwt-auth.guard';

@Controller('organizacoes/:organizacaoId/projetos')
@UseGuards(JwtAuthGuard)
export class ProjetosController {
  constructor(private projetosServico: ProjetosServico) {}

  // ===========================================
  // CRIAR PROJETO
  // ===========================================

  @Post()
  async criar(
    @Param('organizacaoId') organizacaoId: string,
    @Body() dados: CriarProjetoDto,
    @Request() req,
  ) {
    return this.projetosServico.criar(dados, organizacaoId, req.user.id);
  }

  // ===========================================
  // LISTAR PROJETOS
  // ===========================================

  @Get()
  async listar(
    @Param('organizacaoId') organizacaoId: string,
    @Query('incluirArquivados') incluirArquivados: string,
    @Request() req,
  ) {
    const incluir = incluirArquivados === 'true';

    return this.projetosServico.listarPorOrganizacao(organizacaoId, req.user.id, incluir);
  }

  // ===========================================
  // OBTER PROJETO POR ID
  // ===========================================

  @Get(':id')
  async obterPorId(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.projetosServico.obterPorId(id, organizacaoId, req.user.id);
  }

  // ===========================================
  // ATUALIZAR PROJETO
  // ===========================================

  @Put(':id')
  async atualizar(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') id: string,
    @Body() dados: AtualizarProjetoDto,
    @Request() req,
  ) {
    return this.projetosServico.atualizar(id, dados, organizacaoId, req.user.id);
  }

  // ===========================================
  // ARQUIVAR PROJETO
  // ===========================================

  @Patch(':id/arquivar')
  async arquivar(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.projetosServico.arquivar(id, organizacaoId, req.user.id);
  }

  // ===========================================
  // REATIVAR PROJETO
  // ===========================================

  @Patch(':id/reativar')
  async reativar(
    @Param('organizacaoId') organizacaoId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.projetosServico.reativar(id, organizacaoId, req.user.id);
  }
}