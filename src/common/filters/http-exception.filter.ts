import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Filtro global para padronizar respostas de erro HTTP.
 * Converte exceções em um payload consistente para o cliente.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Intercepta exceções lançadas em rotas/handlers HTTP e formata a resposta.
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        details = (exceptionResponse as any).details || null;
      }
    }

    // Tratar erros de validação do class-validator
    if (status === HttpStatus.BAD_REQUEST && Array.isArray(message)) {
      const validationErrors = message.map((error: any) => ({
        campo: error.property,
        valor: error.value,
        mensagem: error.constraints ? Object.values(error.constraints)[0] : error.toString(),
      }));
      
      message = 'Dados inválidos';
      details = { validacoes: validationErrors };
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(details && { details }),
    };

    response.status(status).json(errorResponse);
  }
}
