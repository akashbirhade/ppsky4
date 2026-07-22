export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
export declare const generateOtp: (length?: number) => string;
export declare const generateSecureToken: () => string;
//# sourceMappingURL=hash.d.ts.map