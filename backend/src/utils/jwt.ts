import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '@config/index';

export interface JwtPayload {
  userId: string;
  email: string;
  gender: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

export const signAccessToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
    issuer: 'soulmate-sync',
    audience: 'soulmate-sync-client',
  } as SignOptions);
};

export const signRefreshToken = (payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
    issuer: 'soulmate-sync',
    audience: 'soulmate-sync-client',
  } as SignOptions);
};

export const signResetToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.resetSecret, {
    expiresIn: config.jwt.resetExpiry,
    issuer: 'soulmate-sync',
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: 'soulmate-sync',
    audience: 'soulmate-sync-client',
  }) as JwtPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'soulmate-sync',
    audience: 'soulmate-sync-client',
  }) as RefreshTokenPayload;
};

export const verifyResetToken = (token: string): { userId: string } => {
  return jwt.verify(token, config.jwt.resetSecret, {
    issuer: 'soulmate-sync',
  }) as { userId: string };
};
