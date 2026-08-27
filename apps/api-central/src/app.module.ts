import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database';
import { AutenticacaoModule } from './modules/autenticacao';
import { OrganizacoesModule } from './modules/organizacoes';
import { AmbientesModule } from './modules/ambientes';

@Module({
  imports: [DatabaseModule, AutenticacaoModule, OrganizacoesModule, AmbientesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
