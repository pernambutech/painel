import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database';
import { AutenticacaoModule } from './modules/autenticacao';
import { OrganizacoesModule } from './modules/organizacoes';
import { AmbientesModule } from './modules/ambientes';
import { AgentesModule } from './modules/agentes';
import { ComunicacaoModule } from './modules/comunicacao';

@Module({
  imports: [
    DatabaseModule,
    AutenticacaoModule,
    OrganizacoesModule,
    AmbientesModule,
    AgentesModule,
    ComunicacaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
