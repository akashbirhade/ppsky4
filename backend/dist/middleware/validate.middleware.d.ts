import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
type RequestLocation = 'body' | 'query' | 'params';
export declare const validate: (schema: ZodSchema, location?: RequestLocation) => (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.middleware.d.ts.map