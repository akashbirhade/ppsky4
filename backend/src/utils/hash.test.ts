import { comparePassword, generateOtp, generateSecureToken, hashPassword } from './hash';

describe('hash utilities', () => {
  it('hashes and verifies passwords', async () => {
    const raw = 'P@ssw0rd123';
    const hashed = await hashPassword(raw);

    expect(hashed).not.toEqual(raw);
    await expect(comparePassword(raw, hashed)).resolves.toBe(true);
    await expect(comparePassword('wrong-password', hashed)).resolves.toBe(false);
  });

  it('generates numeric OTP of requested length', () => {
    const otp = generateOtp(6);

    expect(otp).toHaveLength(6);
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('generates unique secure tokens', () => {
    const tokenA = generateSecureToken();
    const tokenB = generateSecureToken();

    expect(tokenA).toBeTruthy();
    expect(tokenB).toBeTruthy();
    expect(tokenA).not.toEqual(tokenB);
  });
});
