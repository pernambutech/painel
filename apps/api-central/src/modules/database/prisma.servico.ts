// Serviço Prisma para NestJS
// Gerencia a conexão com o banco de dados

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaServico
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Conectado ao banco de dados');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Desconectado do banco de dados');
  }
}
