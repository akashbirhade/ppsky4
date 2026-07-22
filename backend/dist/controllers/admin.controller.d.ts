import { Request, Response, NextFunction } from 'express';
export declare const getDashboardStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUserStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getReports: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const reviewReport: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getVerificationRequests: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const processVerification: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getSubscriptions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAnalytics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getAuditLogs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map