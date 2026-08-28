import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Headers de segurança (X-Content-Type-Options, X-Frame-Options, etc.)
  // Helmet é um middleware que adiciona cabeçalhos HTTP de segurança
  // Em produção, protege contra ataques comuns como clickjacking, sniffing, etc.
  const { default: helmet } = await import('helmet');
  app.use(helmet());

  // Configurações globais - CORS para desenvolvimento
  app.enableCors({
    origin: ['http://localhost:4000', 'http://localhost:4001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  // Hooks de desligamento — garante desconexão correta do Prisma
  app.enableShutdownHooks();

  // Validação global de DTOs via class-validator/class-transformer
  app.useGlobalPipes(
    new ValidationPipe({
      // Remove propriedades que não estão nos DTOs
      whitelist: true,
      // Lança erro se propriedade desconhecida estiver presente
      forbidNonWhitelisted: true,
      // Transforma payloads em instâncias dos DTOs
      transform: true,
    }),
  );

  // Porta do servidor
  const port = process.env.PORT || 4001;

  await app.listen(port);
  console.log(`🚀 API Central rodando na porta ${port}`);
}

bootstrap();
