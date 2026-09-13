import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Filtro global de exceções — evita vazamento de stack traces
  app.useGlobalFilters(new AllExceptionsFilter());

  // Headers de segurança (X-Content-Type-Options, X-Frame-Options, etc.)
  // Helmet é um middleware que adiciona cabeçalhos HTTP de segurança
  // Em produção, protege contra ataques comuns como clickjacking, sniffing, etc.
  const { default: helmet } = await import('helmet');
  app.use(helmet());

  // Configurações globais - CORS
  // Em produção: restringir para origens conhecidas
  // Em desenvolvimento: permitir qualquer origem (redelocal)
  const origensPermitidas = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : process.env.NODE_ENV === 'production'
      ? ['http://localhost:4000']
      : true;

  app.enableCors({
    origin: origensPermitidas,
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
