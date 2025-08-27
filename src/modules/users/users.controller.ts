import {
  Controller,
  Post,
  Body,
  Res,
  Headers,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CLIENT_TYPE, NODE_ENV } from 'src/common/constants/constants';
import { ResponseMessages } from 'src/common/constants/response-message.constants';
import { ClientTypeValidationPipe } from 'src/common/pipes/client-validation.pipe';
import { ClientAuthGuard } from 'src/common/guards/client-auth.guard';
import { User } from 'src/entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-client-type') rawClientType: string,
  ): Promise<{ username: string; email: string }> {
    const clientType = new ClientTypeValidationPipe().transform(rawClientType);

    let response;
    const accessToken = await this.usersService.register(registerDto);
    if (clientType === CLIENT_TYPE.WEB) {
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain:
          process.env.NODE_ENV === NODE_ENV.PROD ? '.antino.ca' : undefined,
      });
      response = {
        message: ResponseMessages.AUTH.LOGIN_SUCCESS,
      };
    } else {
      response = {
        message: ResponseMessages.AUTH.LOGIN_SUCCESS,
        accessToken,
      };
    }
    return response;
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-client-type') rawClientType: string,
  ) {
    const clientType = new ClientTypeValidationPipe().transform(rawClientType);

    let response;
    const { accessToken } = await this.usersService.login(loginDto);
    if (clientType === CLIENT_TYPE.WEB) {
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain:
          process.env.NODE_ENV === NODE_ENV.PROD ? '.antino.ca' : undefined,
      });
      response = {
        message: ResponseMessages.AUTH.LOGIN_SUCCESS,
      };
    } else {
      response = {
        message: ResponseMessages.AUTH.LOGIN_SUCCESS,
        accessToken,
      };
    }
    return response;
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Headers('x-client-type') rawClientType: string,
  ) {
    const clientType = new ClientTypeValidationPipe().transform(rawClientType);

    if (clientType === CLIENT_TYPE.WEB) {
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain:
          process.env.NODE_ENV === NODE_ENV.PROD ? '.antino.ca' : undefined,
      });
    }

    return {
      message: ResponseMessages.AUTH.LOGOUT_SUCCESS,
    };
  }

  @UseGuards(ClientAuthGuard)
  @Get('profile')
  getProfile(
    @Req() req,
    @Headers('x-client-type') clientType: string,
  ): Promise<User> {
    return this.usersService.getUserById(req.user.id);
  }
}
