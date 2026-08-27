// Módulo de serviços
// Gerencia criação, listagem, edição e remoção de serviços

import { Module, forwardRef } from '@nestjs/common';
import { ServicosController } from './servicos.controller';
import { ServicosServico } from './servicos.servico';
import { DatabaseModule } from '../database';
import { ComunicacaoModule } from '../comunicacao';

@Module({
  imports: [DatabaseModule, forwardRef(() => ComunicacaoModule)],
  controllers: [ServicosController],
  providers: [ServicosServico],
  exports: [ServicosServico],
})
export class ServicosModule {}
