// Módulo de comunicação
// Gerencia conexões WebSocket com agentes e painel, envio de comandos

import { Module, forwardRef } from '@nestjs/common';
import { ComunicacaoGateway } from './comunicacao.gateway';
import { ComunicacaoPainelGateway } from './comunicacao-painel.gateway';
import { ComandosServico } from './comandos.servico';
import { AgentesModule } from '../agentes';
import { AutenticacaoModule } from '../autenticacao';
import { DatabaseModule } from '../database';

@Module({
  imports: [
    forwardRef(() => AgentesModule),
    AutenticacaoModule,
    DatabaseModule,
  ],
  providers: [ComunicacaoGateway, ComunicacaoPainelGateway, ComandosServico],
  exports: [ComunicacaoGateway, ComunicacaoPainelGateway, ComandosServico],
})
export class ComunicacaoModule {}
