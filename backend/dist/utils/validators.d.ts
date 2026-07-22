import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    mobileNumber: z.ZodString;
    gender: z.ZodEnum<["MALE", "FEMALE", "OTHER"]>;
    dateOfBirth: z.ZodUnion<[z.ZodString, z.ZodString]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    firstName: string;
    lastName: string;
    password: string;
    mobileNumber: string;
    dateOfBirth: string;
}, {
    email: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    firstName: string;
    lastName: string;
    password: string;
    mobileNumber: string;
    dateOfBirth: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    refreshToken?: string | undefined;
}, {
    refreshToken?: string | undefined;
}>;
export declare const verifyOtpSchema: z.ZodObject<{
    otp: z.ZodString;
    type: z.ZodEnum<["email", "mobile"]>;
}, "strip", z.ZodTypeAny, {
    type: "email" | "mobile";
    otp: string;
}, {
    type: "email" | "mobile";
    otp: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    height: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
    maritalStatus: z.ZodOptional<z.ZodEnum<["NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"]>>;
    motherTongue: z.ZodOptional<z.ZodString>;
    religion: z.ZodOptional<z.ZodString>;
    caste: z.ZodOptional<z.ZodString>;
    subCaste: z.ZodOptional<z.ZodString>;
    gothra: z.ZodOptional<z.ZodString>;
    education: z.ZodOptional<z.ZodString>;
    educationDetails: z.ZodOptional<z.ZodString>;
    institution: z.ZodOptional<z.ZodString>;
    profession: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    annualIncome: z.ZodOptional<z.ZodNumber>;
    bio: z.ZodOptional<z.ZodString>;
    hobbies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    familyType: z.ZodOptional<z.ZodString>;
    familyStatus: z.ZodOptional<z.ZodString>;
    fatherOccupation: z.ZodOptional<z.ZodString>;
    motherOccupation: z.ZodOptional<z.ZodString>;
    siblings: z.ZodOptional<z.ZodNumber>;
    city: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    pincode: z.ZodOptional<z.ZodString>;
    whatsappNumber: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    whatsappVisible: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    height?: number | undefined;
    weight?: number | undefined;
    maritalStatus?: "NEVER_MARRIED" | "DIVORCED" | "WIDOWED" | "AWAITING_DIVORCE" | undefined;
    motherTongue?: string | undefined;
    religion?: string | undefined;
    caste?: string | undefined;
    subCaste?: string | undefined;
    gothra?: string | undefined;
    education?: string | undefined;
    educationDetails?: string | undefined;
    institution?: string | undefined;
    profession?: string | undefined;
    company?: string | undefined;
    annualIncome?: number | undefined;
    bio?: string | undefined;
    hobbies?: string[] | undefined;
    familyType?: string | undefined;
    familyStatus?: string | undefined;
    fatherOccupation?: string | undefined;
    motherOccupation?: string | undefined;
    siblings?: number | undefined;
    state?: string | undefined;
    district?: string | undefined;
    city?: string | undefined;
    pincode?: string | undefined;
    whatsappNumber?: string | null | undefined;
    whatsappVisible?: boolean | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    height?: number | undefined;
    weight?: number | undefined;
    maritalStatus?: "NEVER_MARRIED" | "DIVORCED" | "WIDOWED" | "AWAITING_DIVORCE" | undefined;
    motherTongue?: string | undefined;
    religion?: string | undefined;
    caste?: string | undefined;
    subCaste?: string | undefined;
    gothra?: string | undefined;
    education?: string | undefined;
    educationDetails?: string | undefined;
    institution?: string | undefined;
    profession?: string | undefined;
    company?: string | undefined;
    annualIncome?: number | undefined;
    bio?: string | undefined;
    hobbies?: string[] | undefined;
    familyType?: string | undefined;
    familyStatus?: string | undefined;
    fatherOccupation?: string | undefined;
    motherOccupation?: string | undefined;
    siblings?: number | undefined;
    state?: string | undefined;
    district?: string | undefined;
    city?: string | undefined;
    pincode?: string | undefined;
    whatsappNumber?: string | null | undefined;
    whatsappVisible?: boolean | undefined;
}>;
export declare const preferencesSchema: z.ZodObject<{
    minAge: z.ZodOptional<z.ZodNumber>;
    maxAge: z.ZodOptional<z.ZodNumber>;
    minHeight: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    maxHeight: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    religion: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    caste: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    maritalStatus: z.ZodOptional<z.ZodArray<z.ZodEnum<["NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"]>, "many">>;
    motherTongue: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    education: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    profession: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minIncome: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    maxIncome: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    preferredCities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    preferredDistricts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    preferredStates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    maxDistance: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    maritalStatus?: ("NEVER_MARRIED" | "DIVORCED" | "WIDOWED" | "AWAITING_DIVORCE")[] | undefined;
    motherTongue?: string[] | undefined;
    religion?: string[] | undefined;
    caste?: string[] | undefined;
    education?: string[] | undefined;
    profession?: string[] | undefined;
    minAge?: number | undefined;
    maxAge?: number | undefined;
    minHeight?: number | null | undefined;
    maxHeight?: number | null | undefined;
    minIncome?: number | null | undefined;
    maxIncome?: number | null | undefined;
    preferredCities?: string[] | undefined;
    preferredDistricts?: string[] | undefined;
    preferredStates?: string[] | undefined;
    maxDistance?: number | null | undefined;
}, {
    maritalStatus?: ("NEVER_MARRIED" | "DIVORCED" | "WIDOWED" | "AWAITING_DIVORCE")[] | undefined;
    motherTongue?: string[] | undefined;
    religion?: string[] | undefined;
    caste?: string[] | undefined;
    education?: string[] | undefined;
    profession?: string[] | undefined;
    minAge?: number | undefined;
    maxAge?: number | undefined;
    minHeight?: number | null | undefined;
    maxHeight?: number | null | undefined;
    minIncome?: number | null | undefined;
    maxIncome?: number | null | undefined;
    preferredCities?: string[] | undefined;
    preferredDistricts?: string[] | undefined;
    preferredStates?: string[] | undefined;
    maxDistance?: number | null | undefined;
}>;
export declare const sendMessageSchema: z.ZodObject<{
    content: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["TEXT", "IMAGE", "VOICE_NOTE", "VIDEO", "DOCUMENT"]>>;
}, "strip", z.ZodTypeAny, {
    type: "TEXT" | "IMAGE" | "VOICE_NOTE" | "VIDEO" | "DOCUMENT";
    content?: string | undefined;
}, {
    type?: "TEXT" | "IMAGE" | "VOICE_NOTE" | "VIDEO" | "DOCUMENT" | undefined;
    content?: string | undefined;
}>;
export declare const initiateCallSchema: z.ZodObject<{
    receiverId: z.ZodString;
    type: z.ZodEnum<["AUDIO", "VIDEO"]>;
}, "strip", z.ZodTypeAny, {
    type: "VIDEO" | "AUDIO";
    receiverId: string;
}, {
    type: "VIDEO" | "AUDIO";
    receiverId: string;
}>;
export declare const matchFiltersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    minAge: z.ZodOptional<z.ZodNumber>;
    maxAge: z.ZodOptional<z.ZodNumber>;
    minHeight: z.ZodOptional<z.ZodNumber>;
    maxHeight: z.ZodOptional<z.ZodNumber>;
    religion: z.ZodOptional<z.ZodString>;
    caste: z.ZodOptional<z.ZodString>;
    motherTongue: z.ZodOptional<z.ZodString>;
    education: z.ZodOptional<z.ZodString>;
    profession: z.ZodOptional<z.ZodString>;
    minIncome: z.ZodOptional<z.ZodNumber>;
    maxIncome: z.ZodOptional<z.ZodNumber>;
    city: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    maritalStatus: z.ZodOptional<z.ZodString>;
    radius: z.ZodOptional<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodEnum<["newest", "recently_active", "most_viewed", "most_liked"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sort?: "newest" | "recently_active" | "most_viewed" | "most_liked" | undefined;
    maritalStatus?: string | undefined;
    motherTongue?: string | undefined;
    religion?: string | undefined;
    caste?: string | undefined;
    education?: string | undefined;
    profession?: string | undefined;
    state?: string | undefined;
    district?: string | undefined;
    city?: string | undefined;
    minAge?: number | undefined;
    maxAge?: number | undefined;
    minHeight?: number | undefined;
    maxHeight?: number | undefined;
    minIncome?: number | undefined;
    maxIncome?: number | undefined;
    radius?: number | undefined;
}, {
    limit?: number | undefined;
    sort?: "newest" | "recently_active" | "most_viewed" | "most_liked" | undefined;
    maritalStatus?: string | undefined;
    motherTongue?: string | undefined;
    religion?: string | undefined;
    caste?: string | undefined;
    education?: string | undefined;
    profession?: string | undefined;
    state?: string | undefined;
    district?: string | undefined;
    city?: string | undefined;
    minAge?: number | undefined;
    maxAge?: number | undefined;
    minHeight?: number | undefined;
    maxHeight?: number | undefined;
    minIncome?: number | undefined;
    maxIncome?: number | undefined;
    page?: number | undefined;
    radius?: number | undefined;
}>;
//# sourceMappingURL=validators.d.ts.map