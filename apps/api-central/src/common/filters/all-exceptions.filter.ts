import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de exceções.
 * Captura todas as exceções não tratadas e retorna uma resposta padronizada,
 * evitando o vazamento de stack traces e detalhes internos em produção.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(excecao: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensagem = 'Erro interno do servidor';

    if (excecao instanceof HttpException) {
      status = excecao.getStatus();
      const resposta = excecao.getResponse();
      mensagem =
        typeof resposta === 'string'
          ? resposta
          : (resposta as { message?: string | string[] })?.message?.toString() || mensagem;
    } else if (excecao instanceof Error) {
      // Logar erro completo apenas no servidor
      this.logger.error(
        `Exceção não tratada: ${excecao.message}`,
        excecao.stack,
      );
    }

    response.status(status).json({
      statusCode: status,
      message: mensagem,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
