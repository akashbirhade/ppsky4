const mockRefreshToken = jest.fn();

jest.mock('@services/auth.service', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    refreshToken: (...args: any[]) => mockRefreshToken(...args),
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    logoutAll: jest.fn(),
    sendEmailOtp: jest.fn(),
    verifyEmailOtp: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
  })),
}));

import { refreshToken } from './auth.controller';

describe('auth.controller refreshToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const makeRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    return res;
  };

  it('returns 401 when refresh token is missing', async () => {
    const req: any = { cookies: {}, body: {}, headers: {}, ip: '127.0.0.1' };
    const res = makeRes();
    const next = jest.fn();

    await refreshToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Refresh token missing' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns new access token when refresh token is valid', async () => {
    mockRefreshToken.mockResolvedValue({
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
    });

    const req: any = {
      cookies: { refreshToken: 'old_refresh_token' },
      body: {},
      headers: { 'user-agent': 'jest' },
      ip: '127.0.0.1',
    };
    const res = makeRes();
    const next = jest.fn();

    await refreshToken(req, res, next);

    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'new_refresh_token',
      expect.objectContaining({ httpOnly: true, sameSite: 'strict' })
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { accessToken: 'new_access_token' },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
