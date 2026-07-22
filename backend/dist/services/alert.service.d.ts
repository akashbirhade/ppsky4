export declare function sendProfileUpdateAlert(opts: {
    email?: string;
    phone?: string;
    userName: string;
    updatedFields: string[];
}): Promise<{
    email: boolean;
    sms: boolean;
}>;
export declare function sendPhotoUploadAlert(opts: {
    email?: string;
    phone?: string;
    userName: string;
}): Promise<void>;
//# sourceMappingURL=alert.service.d.ts.map