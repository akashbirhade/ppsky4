import {
  signAccessToken,
  signRefreshToken,
  signResetToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyResetToken,
} from './jwt';

describe('jwt utilities', () => {
  it('signs and verifies access tokens', () => {
    const token = signAccessToken({
      userId: 'user_123',
      email: 'test@example.com',
      gender: 'MALE',
      role: 'user',
    });

    const payload = verifyAccessToken(token);
    expect(payload.userId).toBe('user_123');
    expect(payload.email).toBe('test@example.com');
    expect(payload.gender).toBe('MALE');
    expect(payload.role).toBe('user');
  });

  it('signs and verifies refresh tokens', () => {
    const token = signRefreshToken({
      userId: 'user_123',
      tokenId: 'token_abc',
    });

    const payload = verifyRefreshToken(token);
    expect(payload.userId).toBe('user_123');
    expect(payload.tokenId).toBe('token_abc');
  });

  it('signs and verifies reset tokens', () => {
    const token = signResetToken('user_456');
    const payload = verifyResetToken(token);

    expect(payload.userId).toBe('user_456');
  });

  it('rejects invalid access tokens', () => {
    expect(() => verifyAccessToken('invalid.token.value')).toThrow();
  });
});
