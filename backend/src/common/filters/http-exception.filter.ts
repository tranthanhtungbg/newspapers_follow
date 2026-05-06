import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>).message
        : exception instanceof Error
        ? exception.message
        : 'Internal server error';

    const correlationId =
      (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();

    if (status >= 500) {
      this.logger.error(`[${correlationId}] ${status} ${request.method} ${request.url}`, 
        exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(status).json({
      success: false,
      error: {
        code: this.getErrorCode(status, exceptionResponse),
        message,
        correlationId,
      },
    });
  }

  private getErrorCode(status: number, exResponse: unknown): string {
    if (typeof exResponse === 'object' && exResponse !== null) {
      const code = (exResponse as Record<string, unknown>).error;
      if (typeof code === 'string') return code.toUpperCase().replace(/\s+/g, '_');
    }
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return codes[status] ?? 'UNKNOWN_ERROR';
  }
}
