export interface RegisterInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobileNumber: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth: string;
}
export declare class AuthService {
    register(input: RegisterInput, ipAddress?: string, userAgent?: string): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
            gender: import(".prisma/client").$Enums.Gender;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(identifier: string, password: string, ipAddress?: string, userAgent?: string): Promise<{
        user: {
            id: string;
            email: string;
            username: string;
            gender: import(".prisma/client").$Enums.Gender;
            role: string | undefined;
            mobileNumber: string;
            profile: {
                firstName: string;
                lastName: string;
                age: number;
                height: number;
                religion: string;
                education: string;
                profession: string;
                bio: string | null;
                city: string;
                isVerified: boolean;
            } | null;
            subscription: {
                plan: import(".prisma/client").$Enums.SubscriptionPlan;
                isActive: boolean;
            } | null;
            photos: {
                url: string;
            }[];
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(token: string, ipAddress?: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    sendEmailOtp(userId: string, email: string): Promise<void>;
    verifyEmailOtp(userId: string, otp: string): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, otp: string, newPassword: string): Promise<void>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    private issueTokens;
}
//# sourceMappingURL=auth.service.d.ts.map