interface CompatibilityFactors {
    ageScore: number;
    religionScore: number;
    casteScore: number;
    locationScore: number;
    educationScore: number;
    incomeScore: number;
    total: number;
}
export declare function calculateCompatibility(profile: any, target: any, preferences: any, targetPreferences: any): CompatibilityFactors;
export declare class RecommendationService {
    getRecommended(userId: string, gender: 'MALE' | 'FEMALE', page: number, limit: number): Promise<{
        profiles: {
            user: {
                subscription: {
                    plan: import(".prisma/client").$Enums.SubscriptionPlan;
                    isActive: boolean;
                } | null;
                photos: {
                    url: string;
                }[];
                email: string;
                gender: import(".prisma/client").$Enums.Gender;
                password: string;
                mobileNumber: string;
                id: string;
                username: string;
                countryCode: string;
                accountStatus: import(".prisma/client").$Enums.AccountStatus;
                emailVerified: boolean;
                mobileVerified: boolean;
                lastLogin: Date | null;
                lastActive: Date | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
            compatibilityScore: number;
            userId: string;
            firstName: string;
            lastName: string;
            dateOfBirth: Date;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            profileViews: number;
            age: number;
            height: number;
            weight: number | null;
            maritalStatus: import(".prisma/client").$Enums.MaritalStatus;
            motherTongue: string;
            religion: string;
            caste: string;
            subCaste: string | null;
            gothra: string | null;
            manglik: boolean;
            education: string;
            educationDetails: string | null;
            institution: string | null;
            profession: string;
            company: string | null;
            annualIncome: number;
            bio: string | null;
            hobbies: string[];
            familyType: string | null;
            familyStatus: string | null;
            fatherOccupation: string | null;
            motherOccupation: string | null;
            siblings: number | null;
            state: string;
            district: string;
            city: string;
            pincode: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            emailVerificationStatus: import(".prisma/client").$Enums.VerificationStatus;
            mobileVerificationStatus: import(".prisma/client").$Enums.VerificationStatus;
            govtIdVerificationStatus: import(".prisma/client").$Enums.VerificationStatus;
            govtIdType: string | null;
            isVerified: boolean;
            verificationBadge: boolean;
            profileVerifiedAt: Date | null;
            whatsappNumber: string | null;
            whatsappVisible: boolean;
            likesReceived: number;
            superLikesReceived: number;
            profileCompletionPercentage: number;
        }[];
        total: number;
        page: number;
        pages: number;
    }>;
    getCompatibilityScore(userId: string, targetUserId: string): Promise<CompatibilityFactors>;
}
export {};
//# sourceMappingURL=recommendation.service.d.ts.map