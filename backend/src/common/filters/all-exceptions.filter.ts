import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ApiErrorResponse } from '../interceptors/response.interface';

// Declared as `number`, not `HttpStatus`, specifically so the >= comparison
// against a runtime-derived statusCode below doesn't trip
// @typescript-eslint/no-unsafe-enum-comparison (statusCode can be any valid
// HTTP status, not just HttpStatus enum members).
const SERVER_ERROR_THRESHOLD: number = HttpStatus.INTERNAL_SERVER_ERROR;

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.extractMessage(exception);
    const errorName =
      exception instanceof Error ? exception.name : 'InternalServerError';

    const body: ApiErrorResponse = {
      success: false,
      statusCode,
      message,
      error: errorName,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    };

    if (statusCode >= SERVER_ERROR_THRESHOLD) {
      this.logger.error(
        `${request.method} ${request.originalUrl} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${request.method} ${request.originalUrl} - ${message}`);
    }

    response.status(statusCode).json(body);
  }

  private extractMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const msg = response.message;
        return Array.isArray(msg) ? msg.join(', ') : String(msg);
      }
      return exception.message;
    }

    if (exception instanceof Error) {
      // Never leak internal/plaintext error details for unhandled errors
      return 'Internal server error';
    }

    return 'Internal server error';
  }
}
