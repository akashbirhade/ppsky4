import { AppError, errorHandler, notFound } from './error.middleware';

jest.mock('@utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('errorHandler', () => {
  const makeRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('handles AppError with provided status and details', () => {
    const req: any = { url: '/x', method: 'GET', ip: '127.0.0.1' };
    const res = makeRes();
    const err = new AppError('Validation failed', 422, [{ field: 'email' }]);

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Validation failed', details: [{ field: 'email' }] })
    );
  });

  it('maps JWT errors to 401', () => {
    const req: any = { url: '/x', method: 'GET', ip: '127.0.0.1' };
    const res = makeRes();
    const err = new Error('bad token');
    err.name = 'JsonWebTokenError';

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'Invalid token' }));
  });

  it('maps Prisma unique constraint errors to 409', () => {
    const req: any = { url: '/x', method: 'POST', ip: '127.0.0.1' };
    const res = makeRes();
    const err: any = new Error('dup');
    err.code = 'P2002';
    err.meta = { target: ['email'] };

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'Email already exists' }));
  });

  it('creates route-not-found AppError via notFound middleware', () => {
    const req: any = { method: 'GET', path: '/missing' };
    const next = jest.fn();

    notFound(req, {} as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('Route GET /missing not found');
  });
});
