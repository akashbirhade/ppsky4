import { Request, Response, NextFunction } from 'express';
export declare const initiateCall: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const answerCall: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const endCall: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCallHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMissedCalls: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=call.controller.d.ts.map