import bcrypt from 'bcryptjs';
import { config } from '@config/index';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.security.bcryptSaltRounds);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateOtp = (length = 6): string => {
  const crypto = require('crypto');
  return crypto.randomInt(10 ** (length - 1), 10 ** length - 1).toString();
};

export const generateSecureToken = (): string => {
  const { v4: uuidv4 } = require('uuid');
  return uuidv4();
};
