import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  method: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;
    const startTime = Date.now();

    return next.handle().pipe(
      map(data => {
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        // Log successful requests
        this.logger.log(
          `[${request.method}] ${request.url} - ${statusCode} - ${executionTime}ms`,
          {
            method: request.method,
            url: request.url,
            statusCode,
            executionTime,
            userId: (request as any).user?.sub,
          },
        );

        // Transform the response
        return {
          statusCode,
          message: this.getDefaultMessageForStatus(statusCode),
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };
      }),
    );
  }

  private getDefaultMessageForStatus(status: number): string {
    switch (status) {
      case 200:
        return 'OK';
      case 201:
        return 'Created';
      case 204:
        return 'No Content';
      default:
        return 'Success';
    }
  }
}
