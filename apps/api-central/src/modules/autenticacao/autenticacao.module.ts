// Módulo de autenticação
// Gerencia cadastro, login e JWT

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AutenticacaoController } from './autenticacao.controller';
import { AutenticacaoServico } from './autenticacao.servico';
import { EstrategiaJwt } from './estrategia-jwt';
import { DatabaseModule } from '../database';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      // Chave secreta OBRIGATÓRIA via variável de ambiente
      // Se não configurada, a aplicação deve falhar explicitamente
      secret: process.env.JWT_SECRET || (() => {
        throw new Error('JWT_SECRET não configurado. Defina a variável de ambiente JWT_SECRET.');
      })(),
      // Configurações do token
      signOptions: {
        // Expiração: 24 horas
        expiresIn: '24h',
      },
    }),
  ],
  controllers: [AutenticacaoController],
  providers: [AutenticacaoServico, EstrategiaJwt],
  exports: [AutenticacaoServico, JwtModule],
})
export class AutenticacaoModule {}
