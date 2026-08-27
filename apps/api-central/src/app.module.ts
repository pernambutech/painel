import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database';
import { AutenticacaoModule } from './modules/autenticacao';
import { OrganizacoesModule } from './modules/organizacoes';

@Module({
  imports: [DatabaseModule, AutenticacaoModule, OrganizacoesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
