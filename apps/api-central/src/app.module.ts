import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database';
import { AutenticacaoModule } from './modules/autenticacao';
import { OrganizacoesModule } from './modules/organizacoes';
import { AmbientesModule } from './modules/ambientes';
import { AgentesModule } from './modules/agentes';
import { ProjetosModule } from './modules/projetos';
import { ServicosModule } from './modules/servicos';
import { ExecucoesModule } from './modules/execucoes';
import { ComunicacaoModule } from './modules/comunicacao';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    AutenticacaoModule,
    OrganizacoesModule,
    AmbientesModule,
    AgentesModule,
    ProjetosModule,
    ServicosModule,
    ExecucoesModule,
    ComunicacaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
