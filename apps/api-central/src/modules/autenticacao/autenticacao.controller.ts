// Controller de autenticação
// Endpoints para cadastro e login

import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AutenticacaoServico } from './autenticacao.servico';
import type { CadastroDto, LoginDto } from './dto/autenticacao.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AutenticacaoController {
  constructor(private autenticacaoServico: AutenticacaoServico) {}

  // ===========================================
  // CADASTRO
  // ===========================================

  @Post('cadastro')
  async cadastro(@Body() dados: CadastroDto) {
    return this.autenticacaoServico.cadastrar(dados);
  }

  // ===========================================
  // LOGIN
  // ===========================================

  @Post('login')
  async login(@Body() dados: LoginDto) {
    return this.autenticacaoServico.login(dados);
  }

  // ===========================================
  // PERFIL (ROTA PROTEGIDA)
  // ===========================================

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  async obterPerfil(@Request() req) {
    return this.autenticacaoServico.validarUsuario(req.user.id);
  }
}
