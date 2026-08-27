import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database';
import { AutenticacaoModule } from './modules/autenticacao';

@Module({
  imports: [DatabaseModule, AutenticacaoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
