// src/common/guards/client-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ClientType } from '../constants/constants';
import { JwtHelper } from '../helpers/jwt.helper';

@Injectable()
export class ClientAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtHelper: JwtHelper,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const clientType = request.headers['x-client-type'] as string;
    let token: string | undefined;

    if (clientType === ClientType.WEB) {
      token = request.cookies?.['accessToken'];
    } else if (clientType === ClientType.APP) {
      const authHeader = request.headers['authorization'];
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException('Authentication token not found');
    }

    try {
      const payload = this.jwtHelper.verifyToken(token);
      (request as any).user = payload;

      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
