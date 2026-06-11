import { authenticate } from './auth.middleware';
import { AppError } from './error.middleware';

const mockFindUnique = jest.fn();
const mockVerifyAccessToken = jest.fn();

jest.mock('@config/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: (...args: any[]) => mockFindUnique(...args) },
    subscription: { findUnique: jest.fn() },
    adminUser: { findUnique: jest.fn() },
  },
}));

jest.mock('@utils/jwt', () => ({
  ...jest.requireActual('@utils/jwt'),
  verifyAccessToken: (...args: any[]) => mockVerifyAccessToken(...args),
}));

describe('authenticate middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns AppError when no token is provided', async () => {
    const req: any = { headers: {}, cookies: {} };
    const next = jest.fn();

    await authenticate(req, {} as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Authentication token missing');
  });

  it('attaches user and calls next for valid token and active account', async () => {
    mockVerifyAccessToken.mockReturnValue({
      userId: 'user_1',
      email: 'user@example.com',
      gender: 'MALE',
    });
    mockFindUnique.mockResolvedValue({
      id: 'user_1',
      accountStatus: 'ACTIVE',
      deletedAt: null,
    });

    const req: any = { headers: { authorization: 'Bearer token_abc' }, cookies: {} };
    const next = jest.fn();

    await authenticate(req, {} as any, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual(
      expect.objectContaining({
        userId: 'user_1',
        accountStatus: 'ACTIVE',
      })
    );
  });
});
