// Módulo de execuções / histórico

import { Module } from '@nestjs/common';
import { ExecucoesController } from './execucoes.controller';
import { ExecucoesServico } from './execucoes.servico';
import { DatabaseModule } from '../database';

@Module({
  imports: [DatabaseModule],
  controllers: [ExecucoesController],
  providers: [ExecucoesServico],
  exports: [ExecucoesServico],
})
export class ExecucoesModule {}
