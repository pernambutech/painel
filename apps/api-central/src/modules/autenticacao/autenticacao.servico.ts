// Serviço de autenticação
// Gerencia cadastro, login e validação de usuários

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaServico } from '../database/prisma.servico';
import { CadastroDto, LoginDto, RespostaAutenticacao } from './dto/autenticacao.dto';

@Injectable()
export class AutenticacaoServico {
  constructor(
    private prisma: PrismaServico,
    private jwtService: JwtService,
  ) {}

  // ===========================================
  // CADASTRO
  // ===========================================

  async cadastrar(dados: CadastroDto): Promise<RespostaAutenticacao> {
    // Verificar se o email já existe
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { email: dados.email },
    });

    if (usuarioExistente) {
      throw new ConflictException('Email já cadastrado');
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(dados.senha, salt);

    // Criar usuário
    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,
      },
    });

    // Gerar token
    return this.gerarToken(usuario.id, usuario.nome, usuario.email);
  }

  // ===========================================
  // LOGIN
  // ===========================================

  async login(dados: LoginDto): Promise<RespostaAutenticacao> {
    // Buscar usuário por email
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dados.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(dados.senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar token
    return this.gerarToken(usuario.id, usuario.nome, usuario.email);
  }

  // ===========================================
  // VALIDAR USUÁRIO
  // ===========================================

  async validarUsuario(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo');
    }

    return usuario;
  }

  // ===========================================
  // GERAR TOKEN
  // ===========================================

  private gerarToken(id: string, nome: string, email: string): RespostaAutenticacao {
    const payload = { sub: id, email };

    const token = this.jwtService.sign(payload);

    return {
      token,
      usuario: {
        id,
        nome,
        email,
      },
    };
  }
}
