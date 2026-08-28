// Serviço de autenticação
// Gerencia cadastro, login e validação de usuários

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaServico } from '../database/prisma.servico';
import { AlterarSenhaDto, AtualizarPerfilDto, CadastroDto, LoginDto, RespostaAutenticacao } from './dto/autenticacao.dto';

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

    // Criar usuário e organização padrão em uma transação
    const resultado = await this.prisma.$transaction(async (tx) => {
      // Criar usuário
      const usuario = await tx.usuario.create({
        data: {
          nome: dados.nome,
          email: dados.email,
          senha: senhaHash,
        },
      });

      // Criar organização padrão com o nome do usuário
      const slug = this.gerarSlug(dados.nome);
      const organizacao = await tx.organizacao.create({
        data: {
          nome: `${dados.nome}'s Workspace`,
          slug,
        },
      });

      // Adicionar usuário como proprietário
      await tx.membroOrganizacao.create({
        data: {
          usuarioId: usuario.id,
          organizacaoId: organizacao.id,
          papel: 'proprietario',
        },
      });

      return { usuario, organizacao };
    });

    // Gerar token
    return this.gerarToken(resultado.usuario.id, resultado.usuario.nome, resultado.usuario.email);
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

  async atualizarPerfil(id: string, dados: AtualizarPerfilDto) {
    if (dados.email) {
      const existente = await this.prisma.usuario.findFirst({ where: { email: dados.email, NOT: { id } } });
      if (existente) throw new ConflictException('Email já cadastrado');
    }
    return this.prisma.usuario.update({
      where: { id },
      data: { ...(dados.nome !== undefined && { nome: dados.nome }), ...(dados.email !== undefined && { email: dados.email }) },
      select: { id: true, nome: true, email: true, ativo: true },
    });
  }

  async alterarSenha(id: string, dados: AlterarSenhaDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario || !(await bcrypt.compare(dados.senhaAtual, usuario.senha))) {
      throw new UnauthorizedException('Senha atual inválida');
    }
    const senha = await bcrypt.hash(dados.novaSenha, 10);
    await this.prisma.usuario.update({ where: { id }, data: { senha } });
    return { mensagem: 'Senha alterada com sucesso' };
  }

  // ===========================================
  // GERAR SLUG
  // ===========================================

  private gerarSlug(nome: string): string {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
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
