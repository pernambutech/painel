// Estratégia JWT para autenticação
// Valida o token JWT extraído da requisição

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Payload do token JWT
export interface PayloadJwt {
  sub: string; // ID do usuário
  email: string;
}

// Usuário retornado após validação
export interface UsuarioJwt {
  id: string;
  email: string;
}

@Injectable()
export class EstrategiaJwt extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      // Extrair token do header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Não ignorar expiração
      ignoreExpiration: false,
      // Chave secreta OBRIGATÓRIA (deve ser a mesma do JwtModule)
      secretOrKey: process.env.JWT_SECRET || (() => {
        throw new Error('JWT_SECRET não configurado. Defina a variável de ambiente JWT_SECRET.');
      })(),
    });
  }

  // Validação do payload do token
  // O que retornar aqui será adicionado ao request.user
  async validate(payload: PayloadJwt): Promise<UsuarioJwt> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token inválido');
    }

    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
