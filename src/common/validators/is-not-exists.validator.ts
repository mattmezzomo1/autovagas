import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
@ValidatorConstraint({ name: 'isNotExists', async: true })
export class IsNotExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments) {
    if (!value) {
      return true; // Skip validation if value is null or undefined
    }

    const [entityClass, property = args.property] = args.constraints;
    
    const count = await this.dataSource
      .getRepository(entityClass)
      .count({ where: { [property]: value } });
    
    return count === 0;
  }

  defaultMessage(args: ValidationArguments) {
    const [entityClass, property = args.property] = args.constraints;
    const entity = entityClass.name || 'Entity';
    
    return `${entity} with this ${property} already exists`;
  }
}

export function IsNotExists(
  entityClass: any,
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityClass, property],
      validator: IsNotExistsConstraint,
    });
  };
}
