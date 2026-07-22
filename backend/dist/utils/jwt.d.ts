export interface JwtPayload {
    userId: string;
    email: string;
    gender: string;
    role?: string;
    iat?: number;
    exp?: number;
}
export interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
    iat?: number;
    exp?: number;
}
export declare const signAccessToken: (payload: Omit<JwtPayload, "iat" | "exp">) => string;
export declare const signRefreshToken: (payload: Omit<RefreshTokenPayload, "iat" | "exp">) => string;
export declare const signResetToken: (userId: string) => string;
export declare const verifyAccessToken: (token: string) => JwtPayload;
export declare const verifyRefreshToken: (token: string) => RefreshTokenPayload;
export declare const verifyResetToken: (token: string) => {
    userId: string;
};
//# sourceMappingURL=jwt.d.ts.map