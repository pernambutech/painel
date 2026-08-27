// Módulo de comunicação
// Gerencia conexões WebSocket com agentes

import { Module } from '@nestjs/common';
import { ComunicacaoGateway } from './comunicacao.gateway';
import { AgentesModule } from '../agentes';

@Module({
  imports: [AgentesModule],
  providers: [ComunicacaoGateway],
  exports: [ComunicacaoGateway],
})
export class ComunicacaoModule {}
