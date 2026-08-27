// Módulo de projetos
// Gerencia criação, listagem, edição e arquivamento de projetos

import { Module } from '@nestjs/common';
import { ProjetosController } from './projetos.controller';
import { ProjetosServico } from './projetos.servico';
import { DatabaseModule } from '../database';

@Module({
  imports: [DatabaseModule],
  controllers: [ProjetosController],
  providers: [ProjetosServico],
  exports: [ProjetosServico],
})
export class ProjetosModule {}