import { z } from 'zod';
import { validate } from './validate.middleware';
import { AppError } from './error.middleware';

describe('validate middleware', () => {
  it('passes and coerces valid payload', () => {
    const schema = z.object({ page: z.coerce.number().int().min(1) });
    const middleware = validate(schema, 'query');

    const req: any = { query: { page: '2' } };
    const next = jest.fn();

    middleware(req, {} as any, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.query.page).toBe(2);
  });

  it('forwards AppError when validation fails', () => {
    const schema = z.object({ page: z.coerce.number().int().min(1) });
    const middleware = validate(schema, 'query');

    const req: any = { query: { page: '0' } };
    const next = jest.fn();

    middleware(req, {} as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(422);
    expect(err.message).toBe('Validation failed');
  });
});
