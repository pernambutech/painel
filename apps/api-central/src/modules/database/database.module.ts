// Módulo de banco de dados
// Fornece o PrismaClient para toda a aplicação

import { Global, Module } from '@nestjs/common';
import { PrismaServico } from './prisma.servico';

@Global()
@Module({
  providers: [PrismaServico],
  exports: [PrismaServico],
})
export class DatabaseModule {}
