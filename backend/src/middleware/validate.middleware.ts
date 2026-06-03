import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './error.middleware';

type RequestLocation = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, location: RequestLocation = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[location]);

    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      next(new AppError('Validation failed', 422, errors));
      return;
    }

    // Replace request data with coerced/validated data
    req[location] = result.data as any;
    next();
  };
