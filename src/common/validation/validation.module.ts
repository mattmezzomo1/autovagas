import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '../pipes/validation.pipe';
import { IsExistsConstraint } from '../validators/is-exists.validator';
import { IsNotExistsConstraint } from '../validators/is-not-exists.validator';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    IsExistsConstraint,
    IsNotExistsConstraint,
  ],
  exports: [
    IsExistsConstraint,
    IsNotExistsConstraint,
  ],
})
export class ValidationModule {}
