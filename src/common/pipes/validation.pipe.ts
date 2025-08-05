import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private readonly logger = new Logger(ValidationPipe.name);

  async transform(value: any, { metatype }: ArgumentMetadata) {
    // If no metatype or it's a primitive type, skip validation
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Convert plain object to class instance
    const object = plainToInstance(metatype, value);

    // Validate the object
    const errors = await validate(object, {
      whitelist: true, // Strip properties not in the DTO
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      forbidUnknownValues: true, // Throw error if unknown values are present
      skipMissingProperties: false, // Don't skip validation of missing properties
      validationError: { target: false }, // Don't include the target object in errors
    });

    // If there are validation errors, throw a BadRequestException
    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      this.logger.warn(`Validation failed: ${JSON.stringify(formattedErrors)}`);
      throw new BadRequestException({
        message: 'Validation failed',
        error: 'Bad Request',
        errors: formattedErrors,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};
    
    const formatError = (error: any, parentPath = '') => {
      const property = parentPath ? `${parentPath}.${error.property}` : error.property;
      
      if (error.constraints) {
        formattedErrors[property] = Object.values(error.constraints);
      }
      
      if (error.children && error.children.length > 0) {
        error.children.forEach((child: any) => formatError(child, property));
      }
    };
    
    errors.forEach(error => formatError(error));
    
    return formattedErrors;
  }
}
