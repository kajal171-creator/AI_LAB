import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { ILogin } from 'src/common/interfaces/entity.interface';

export class LoginUserDto implements ILogin {
  @ApiProperty({ required: true })
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
