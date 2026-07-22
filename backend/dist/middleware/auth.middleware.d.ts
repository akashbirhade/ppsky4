import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '@utils/jwt';
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload & {
                accountStatus: string;
            };
        }
    }
}
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const requireVerified: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const requirePremium: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const requireAdmin: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map