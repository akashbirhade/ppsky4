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
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const generateSecureToken = (): string => {
  const { v4: uuidv4 } = require('uuid');
  return uuidv4();
};
