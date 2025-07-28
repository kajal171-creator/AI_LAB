import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from '../../entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { IJwtPayload } from 'src/common/interfaces/jwtPayload.interface';
import { BcryptHelper } from 'src/common/helpers/bcrypt.helper';
import { JwtHelper } from 'src/common/helpers/jwt.helper';
import { ResponseMessages } from 'src/common/constants/response-message.constants';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class UsersService {
  private readonly jwtHelper: JwtHelper;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
    this.jwtHelper = new JwtHelper(jwtService);
  }
  async register(registerDto: RegisterUserDto): Promise<string> {
    const email = registerDto.email.toLowerCase();
    const username = registerDto.username;

    const [emailExists, userNameExists] = await Promise.all([
      this.findUser({
        where: { email, role: UserRole.USER },
      }),
      this.findUser({
        where: { username },
      }),
    ]);
    if (emailExists) {
      throw new BadRequestException(ResponseMessages.USER.EMAIL_ALREADY_EXISTS);
    }

    if (userNameExists) {
      throw new BadRequestException(
        ResponseMessages.USER.USERNAME_ALREADY_EXISTS,
      );
    }

    const hashedPassword = await BcryptHelper.hash(registerDto.password);

    const user = await this.createUser({
      ...registerDto,
      email,
      password: hashedPassword,
    });
    const payload: IJwtPayload = {
      id: user.id,
      roleName: user.role,
    };

    return this.jwtHelper.signToken(payload);
  }

  async login(loginDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { email, username, password } = loginDto;

    const identifier = email?.toLowerCase() || username;
    const whereClause = email
      ? { email: identifier }
      : { username: identifier };

    whereClause['role'] = UserRole.USER;

    const user = await this.findUser({
      where: whereClause,
      select: ['id', 'password', 'role'],
    });

    if (!user || !(await BcryptHelper.compare(password, user.password))) {
      throw new BadRequestException(ResponseMessages.USER.INVALID_CREDENTIALS);
    }

    const payload: IJwtPayload = {
      id: user.id,
      roleName: user.role,
    };

    return {
      accessToken: this.jwtHelper.signToken(payload),
    };
  }

  private async findUser(
    options: Parameters<Repository<User>['findOne']>[0],
  ): Promise<User | null> {
    return this.userRepository.findOne(options);
  }

  private async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
}
