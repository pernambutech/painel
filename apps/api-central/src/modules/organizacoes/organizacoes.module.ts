// Módulo de organizações
// Gerencia criação, listagem e contexto de organizações

import { Module } from '@nestjs/common';
import { OrganizacoesController } from './organizacoes.controller';
import { OrganizacoesServico } from './organizacoes.servico';
import { DatabaseModule } from '../database';

@Module({
  imports: [DatabaseModule],
  controllers: [OrganizacoesController],
  providers: [OrganizacoesServico],
  exports: [OrganizacoesServico],
})
export class OrganizacoesModule {}
