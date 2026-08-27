// Módulo de agentes
// Gerencia registro, autenticação, heartbeat e status dos agentes

import { Module } from '@nestjs/common';
import { AgentesController } from './agentes.controller';
import { AgentesServico } from './agentes.servico';
import { DatabaseModule } from '../database';

@Module({
  imports: [DatabaseModule],
  controllers: [AgentesController],
  providers: [AgentesServico],
  exports: [AgentesServico],
})
export class AgentesModule {}
