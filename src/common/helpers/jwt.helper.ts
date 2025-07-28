import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from 'src/common/interfaces/jwtPayload.interface';
import { UnauthorizedException, Injectable } from '@nestjs/common';

@Injectable()
export class JwtHelper {
  constructor(private readonly jwtService: JwtService) {}

  signToken(payload: IJwtPayload): string {
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): IJwtPayload {
    try {
      const payload = this.jwtService.verify<IJwtPayload>(token);
      return payload;
    } catch (err) {
      console.error('JWT verification failed:', err?.message || err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
