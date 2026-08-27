// Módulo de comunicação
// Gerencia conexões WebSocket com agentes e envio de comandos

import { Module, forwardRef } from '@nestjs/common';
import { ComunicacaoGateway } from './comunicacao.gateway';
import { ComandosServico } from './comandos.servico';
import { AgentesModule } from '../agentes';

@Module({
  imports: [
    forwardRef(() => AgentesModule),
  ],
  providers: [ComunicacaoGateway, ComandosServico],
  exports: [ComunicacaoGateway, ComandosServico],
})
export class ComunicacaoModule {}
