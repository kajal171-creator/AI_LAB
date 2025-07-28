// src/common/validators/email-or-username.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsEmailOrUsername(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrUsername',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const { email, username } = args.object as any;
          return !!(email || username);
        },
      },
    });
  };
}
