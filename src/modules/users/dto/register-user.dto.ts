import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';
import { IUser } from '../../../common/interfaces/entity.interface';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto implements IUser {
  @ApiProperty()
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
