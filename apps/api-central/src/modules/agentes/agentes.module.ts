// Módulo de agentes
// Gerencia registro, autenticação, heartbeat e status dos agentes

import { Module, forwardRef } from '@nestjs/common';
import { AgentesController } from './agentes.controller';
import { AgentesServico } from './agentes.servico';
import { DatabaseModule } from '../database';
import { ComunicacaoModule } from '../comunicacao';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => ComunicacaoModule),
  ],
  controllers: [AgentesController],
  providers: [AgentesServico],
  exports: [AgentesServico],
})
export class AgentesModule {}
