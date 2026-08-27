// Módulo de ambientes
// Gerencia criação, listagem e consulta de ambientes

import { Module } from '@nestjs/common';
import { AmbientesController } from './ambientes.controller';
import { AmbientesServico } from './ambientes.servico';
import { DatabaseModule } from '../database';

@Module({
  imports: [DatabaseModule],
  controllers: [AmbientesController],
  providers: [AmbientesServico],
  exports: [AmbientesServico],
})
export class AmbientesModule {}
