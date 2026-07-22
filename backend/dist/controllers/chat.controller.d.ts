import { Request, Response, NextFunction } from 'express';
export declare const getConversations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrCreateConversation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMessages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const sendMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const markConversationRead: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=chat.controller.d.ts.map