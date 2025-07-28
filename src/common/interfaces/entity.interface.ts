import e from 'express';

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
