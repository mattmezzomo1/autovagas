import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { ValidationError } from 'class-validator';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let errors = null;
    let stack = null;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
        errors = (exceptionResponse as any).errors || null;
      }
    } else if (exception instanceof EntityNotFoundError) {
      // Handle TypeORM entity not found errors
      status = HttpStatus.NOT_FOUND;
      message = 'Entity not found';
      error = 'Not Found';
    } else if (exception instanceof QueryFailedError) {
      // Handle TypeORM query errors
      status = HttpStatus.BAD_REQUEST;
      message = (exception as any).message || 'Database query failed';
      error = 'Bad Request';
      
      // Check for unique constraint violations
      if ((exception as any).code === '23505') {
        message = 'Duplicate entry';
      }
    } else if (Array.isArray(exception) && exception[0] instanceof ValidationError) {
      // Handle class-validator validation errors
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      error = 'Bad Request';
      errors = this.formatValidationErrors(exception as ValidationError[]);
    } else if (exception instanceof Error) {
      // Handle generic errors
      message = exception.message;
    }

    // Include stack trace in development environment
    if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
      stack = exception.stack;
    }

    // Log the error
    this.logError(request, exception, status, message);

    // Return standardized error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      errors,
      ...(stack && { stack }),
    });
  }

  private formatValidationErrors(validationErrors: ValidationError[]): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};
    
    const formatError = (error: ValidationError, parentPath = '') => {
      const property = parentPath ? `${parentPath}.${error.property}` : error.property;
      
      if (error.constraints) {
        formattedErrors[property] = Object.values(error.constraints);
      }
      
      if (error.children && error.children.length > 0) {
        error.children.forEach(child => formatError(child, property));
      }
    };
    
    validationErrors.forEach(error => formatError(error));
    
    return formattedErrors;
  }

  private logError(request: Request, exception: unknown, status: number, message: string) {
    const logContext = {
      url: request.url,
      method: request.method,
      ip: request.ip,
      userId: (request as any).user?.sub,
      userAgent: request.headers['user-agent'],
    };
    
    // Log based on severity
    if (status >= 500) {
      this.logger.error(
        `[${status}] ${message}`,
        exception instanceof Error ? exception.stack : null,
        logContext,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `[${status}] ${message}`,
        logContext,
      );
    } else {
      this.logger.log(
        `[${status}] ${message}`,
        logContext,
      );
    }
  }
}
