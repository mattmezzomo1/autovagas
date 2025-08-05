import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidPassword', async: false })
export class IsValidPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string) {
    if (!password || typeof password !== 'string') {
      return false;
    }

    // Password must be at least 8 characters long
    if (password.length < 8) {
      return false;
    }

    // Password must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return false;
    }

    // Password must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return false;
    }

    // Password must contain at least one number
    if (!/[0-9]/.test(password)) {
      return false;
    }

    // Password must contain at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
  }
}

export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPasswordConstraint,
    });
  };
}
