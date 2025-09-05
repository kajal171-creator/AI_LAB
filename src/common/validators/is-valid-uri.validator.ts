import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsValidUriConstraint implements ValidatorConstraintInterface {
  validate(uri: any, args: ValidationArguments) {
    if (typeof uri !== 'string') return false;
    // Check for valid web URL or a local file URI
    return /^(https?:\/\/|file:\/\/\/)/i.test(uri);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Each resume link must be a valid web URL (http/https) or a local file path (file:///...).';
  }
}

export function IsValidUri(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidUriConstraint,
    });
  };
}

