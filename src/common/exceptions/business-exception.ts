import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    error: string = 'Business Rule Violation',
    errors: Record<string, any> = null,
  ) {
    super(
      {
        message,
        error,
        statusCode,
        ...(errors && { errors }),
      },
      statusCode,
    );
  }
}

export class ResourceNotFoundException extends BusinessException {
  constructor(
    resource: string,
    id?: string | number,
  ) {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    
    super(message, HttpStatus.NOT_FOUND, 'Not Found');
  }
}

export class DuplicateResourceException extends BusinessException {
  constructor(
    resource: string,
    field: string,
    value: string | number,
  ) {
    super(
      `${resource} with ${field} '${value}' already exists`,
      HttpStatus.CONFLICT,
      'Conflict',
    );
  }
}

export class UnauthorizedAccessException extends BusinessException {
  constructor(
    message: string = 'You do not have permission to access this resource',
  ) {
    super(message, HttpStatus.FORBIDDEN, 'Forbidden');
  }
}

export class InvalidOperationException extends BusinessException {
  constructor(
    message: string,
  ) {
    super(message, HttpStatus.BAD_REQUEST, 'Invalid Operation');
  }
}

export class ValidationException extends BusinessException {
  constructor(
    errors: Record<string, string[]>,
  ) {
    super(
      'Validation failed',
      HttpStatus.BAD_REQUEST,
      'Validation Error',
      errors,
    );
  }
}
