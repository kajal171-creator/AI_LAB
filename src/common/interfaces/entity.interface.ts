import { UUID } from 'crypto';
import e from 'express';
import { UserRole, MessageStatus } from 'src/common/enums/role.enum';

interface ICrud {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface IUser {
  username: string;
  email: string;
  password: string;
}

export interface ILogin {
  username?: string;
  email?: string;
  password: string;
}

export interface ICreateRagChatDto {
  message: string;
  senderId: UUID;
  receiverId: UUID;
  type: UserRole;
}