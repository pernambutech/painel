// Controller de autenticação
// Endpoints para cadastro e login

import { Controller, Post, Body, UseGuards, Get, Put, Request } from '@nestjs/common';
import { AutenticacaoServico } from './autenticacao.servico';
import { AlterarSenhaDto, AtualizarPerfilDto, CadastroDto, LoginDto } from './dto/autenticacao.dto';
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

  @UseGuards(JwtAuthGuard)
  @Put('perfil')
  async atualizarPerfil(@Body() dados: AtualizarPerfilDto, @Request() req) {
    return this.autenticacaoServico.atualizarPerfil(req.user.id, dados);
  }

  @UseGuards(JwtAuthGuard)
  @Put('senha')
  async alterarSenha(@Body() dados: AlterarSenhaDto, @Request() req) {
    return this.autenticacaoServico.alterarSenha(req.user.id, dados);
  }
}
