// Módulo de serviços
// Gerencia criação, listagem, edição e remoção de serviços

import { Module } from '@nestjs/common';
import { ServicosController } from './servicos.controller';
import { ServicosServico } from './servicos.servico';
import { DatabaseModule } from '../database';

@Module({
  imports: [DatabaseModule],
  controllers: [ServicosController],
  providers: [ServicosServico],
  exports: [ServicosServico],
})
export class ServicosModule {}
