import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  initiateCallSchema,
  matchFiltersSchema,
} from './validators';

describe('validators', () => {
  it('accepts a valid register payload', () => {
    const result = registerSchema.safeParse({
      firstName: 'Aakash',
      lastName: 'Birhade',
      email: 'aakash@example.com',
      password: 'Strong@123',
      mobileNumber: '9876543210',
      gender: 'MALE',
      dateOfBirth: '1995-01-01',
    });

    expect(result.success).toBe(true);
  });

  it('rejects weak passwords for register', () => {
    const result = registerSchema.safeParse({
      firstName: 'Aakash',
      lastName: 'Birhade',
      email: 'aakash@example.com',
      password: 'weakpass',
      mobileNumber: '9876543210',
      gender: 'MALE',
      dateOfBirth: '1995-01-01',
    });

    expect(result.success).toBe(false);
  });

  it('validates login payload', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'invalid', password: 'x' }).success).toBe(false);
  });

  it('accepts partial profile updates', () => {
    const result = updateProfileSchema.safeParse({
      city: 'Pune',
      annualIncome: 1200000,
      whatsappNumber: '9876543210',
    });
    expect(result.success).toBe(true);
  });

  it('validates call initiation payload', () => {
    const ok = initiateCallSchema.safeParse({
      receiverId: 'clx4r8u8x0000abc123def456',
      type: 'AUDIO',
    });
    const bad = initiateCallSchema.safeParse({
      receiverId: 'not-cuid',
      type: 'AUDIO',
    });

    expect(ok.success).toBe(true);
    expect(bad.success).toBe(false);
  });

  it('coerces and validates match filters', () => {
    const result = matchFiltersSchema.safeParse({
      page: '2',
      limit: '10',
      minAge: '24',
      maxAge: '32',
      sort: 'newest',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
      expect(result.data.minAge).toBe(24);
      expect(result.data.maxAge).toBe(32);
    }
  });
});
