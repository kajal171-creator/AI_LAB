import { hash, compare } from 'bcryptjs';

export const BcryptHelper = {
  hash: async (plainText: string, saltRounds = 10): Promise<string> => {
    if (!plainText) throw new Error('Password cannot be empty');
    return hash(plainText, saltRounds);
  },

  compare: async (plainText: string, hash: string): Promise<boolean> => {
    return compare(plainText, hash);
  },
};
