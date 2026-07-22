export declare const config: {
    readonly env: string;
    readonly port: number;
    readonly apiVersion: string;
    readonly isProduction: boolean;
    readonly db: {
        readonly url: string;
    };
    readonly redis: {
        readonly url: string;
    };
    readonly jwt: {
        readonly accessSecret: string;
        readonly refreshSecret: string;
        readonly accessExpiry: string;
        readonly refreshExpiry: string;
        readonly resetSecret: string;
        readonly resetExpiry: string;
    };
    readonly cors: {
        readonly allowedOrigins: string[];
    };
    readonly cloudinary: {
        readonly cloudName: string;
        readonly apiKey: string;
        readonly apiSecret: string;
        readonly uploadPreset: string;
    };
    readonly smtp: {
        readonly host: string;
        readonly port: number;
        readonly secure: boolean;
        readonly user: string;
        readonly pass: string;
        readonly from: string;
    };
    readonly twilio: {
        readonly accountSid: string;
        readonly authToken: string;
        readonly phoneNumber: string;
    };
    readonly webrtc: {
        readonly turnServer: string;
        readonly turnUsername: string;
        readonly turnCredential: string;
        readonly stunServer: string;
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly maxRequests: number;
        readonly authMaxRequests: number;
    };
    readonly security: {
        readonly bcryptSaltRounds: number;
        readonly cookieSecret: string;
    };
    readonly pagination: {
        readonly defaultPageSize: number;
        readonly maxPageSize: number;
    };
    readonly admin: {
        readonly email: string;
        readonly password: string;
    };
};
//# sourceMappingURL=index.d.ts.map