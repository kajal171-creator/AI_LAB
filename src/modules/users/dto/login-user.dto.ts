import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, ValidateIf } from 'class-validator';
import { ILogin } from 'src/common/interfaces/entity.interface';
import { IsEmailOrUsername } from 'src/common/validators/email-or-username.validator';

export class LoginUserDto implements ILogin {
  @ApiProperty({ required: false })
  @ValidateIf((obj) => obj.email !== undefined && obj.email !== '')
  @IsEmail({}, { message: 'Email must be valid' })
  email?: string;

  @ApiProperty({ required: false })
  username?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsEmailOrUsername({
    message: 'Either email or username must be provided',
  })
  _atLeastOne: string;
}
