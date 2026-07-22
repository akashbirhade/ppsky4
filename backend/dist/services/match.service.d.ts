export declare function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number;
export declare class MatchService {
    getNewProfiles(userId: string, gender: 'MALE' | 'FEMALE', filters: any, page: number, limit: number): Promise<{
        profiles: {
            user: {
                subscription: {
                    plan: import(".prisma/client").$Enums.SubscriptionPlan;
                    isActive: boolean;
                } | null;
                gender: import(".prisma/client").$Enums.Gender;
                id: string;
                accountStatus: import(".prisma/client").$Enums.AccountStatus;
                lastActive: Date | null;
                photos: {
                    url: string;
                }[];
            };
            firstName: string;
            lastName: string;
            id: string;
            profileViews: number;
            age: number;
            height: number;
            maritalStatus: import(".prisma/client").$Enums.MaritalStatus;
            motherTongue: string;
            religion: string;
            caste: string;
            education: string;
            profession: string;
            annualIncome: number;
            bio: string | null;
            state: string;
            district: string;
            city: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            isVerified: boolean;
            verificationBadge: boolean;
            likesReceived: number;
            profileCompletionPercentage: number;
        }[];
        total: number;
        page: number;
        pages: number;
    }>;
    getRecentlyActive(userId: string, gender: 'MALE' | 'FEMALE', filters: any, page: number, limit: number): Promise<{
        profiles: {
            user: {
                subscription: {
                    plan: import(".prisma/client").$Enums.SubscriptionPlan;
                    isActive: boolean;
                } | null;
                gender: import(".prisma/client").$Enums.Gender;
                id: string;
                accountStatus: import(".prisma/client").$Enums.AccountStatus;
                lastActive: Date | null;
                photos: {
                    url: string;
                }[];
            };
            firstName: string;
            lastName: string;
            id: string;
            profileViews: number;
            age: number;
            height: number;
            maritalStatus: import(".prisma/client").$Enums.MaritalStatus;
            motherTongue: string;
            religion: string;
            caste: string;
            education: string;
            profession: string;
            annualIncome: number;
            bio: string | null;
            state: string;
            district: string;
            city: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            isVerified: boolean;
            verificationBadge: boolean;
            likesReceived: number;
            profileCompletionPercentage: number;
        }[];
        total: number;
        page: number;
        pages: number;
    }>;
    getNearMe(userId: string, gender: 'MALE' | 'FEMALE', filters: any, page: number, limit: number): Promise<{
        profiles: {
            distance: any;
            user: {
                subscription: {
                    plan: import(".prisma/client").$Enums.SubscriptionPlan;
                    isActive: boolean;
                } | null;
                gender: import(".prisma/client").$Enums.Gender;
                id: string;
                accountStatus: import(".prisma/client").$Enums.AccountStatus;
                lastActive: Date | null;
                photos: {
                    url: string;
                }[];
            };
            firstName: string;
            lastName: string;
            id: string;
            profileViews: number;
            age: number;
            height: number;
            maritalStatus: import(".prisma/client").$Enums.MaritalStatus;
            motherTongue: string;
            religion: string;
            caste: string;
            education: string;
            profession: string;
            annualIncome: number;
            bio: string | null;
            state: string;
            district: string;
            city: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            isVerified: boolean;
            verificationBadge: boolean;
            likesReceived: number;
            profileCompletionPercentage: number;
        }[];
        total: number;
        page: number;
        pages: number;
    }>;
    getMostViewed(userId: string, gender: 'MALE' | 'FEMALE', filters: any, page: number, limit: number): Promise<{
        profiles: {
            user: {
                subscription: {
                    plan: import(".prisma/client").$Enums.SubscriptionPlan;
                    isActive: boolean;
                } | null;
                gender: import(".prisma/client").$Enums.Gender;
                id: string;
                accountStatus: import(".prisma/client").$Enums.AccountStatus;
                lastActive: Date | null;
                photos: {
                    url: string;
                }[];
            };
            firstName: string;
            lastName: string;
            id: string;
            profileViews: number;
            age: number;
            height: number;
            maritalStatus: import(".prisma/client").$Enums.MaritalStatus;
            motherTongue: string;
            religion: string;
            caste: string;
            education: string;
            profession: string;
            annualIncome: number;
            bio: string | null;
            state: string;
            district: string;
            city: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            isVerified: boolean;
            verificationBadge: boolean;
            likesReceived: number;
            profileCompletionPercentage: number;
        }[];
        total: number;
        page: number;
        pages: number;
    }>;
    getMostLiked(userId: string, gender: 'MALE' | 'FEMALE', filters: any, page: number, limit: number): Promise<{
        profiles: {
            user: {
                subscription: {
                    plan: import(".prisma/client").$Enums.SubscriptionPlan;
                    isActive: boolean;
                } | null;
                gender: import(".prisma/client").$Enums.Gender;
                id: string;
                accountStatus: import(".prisma/client").$Enums.AccountStatus;
                lastActive: Date | null;
                photos: {
                    url: string;
                }[];
            };
            firstName: string;
            lastName: string;
            id: string;
            profileViews: number;
            age: number;
            height: number;
            maritalStatus: import(".prisma/client").$Enums.MaritalStatus;
            motherTongue: string;
            religion: string;
            caste: string;
            education: string;
            profession: string;
            annualIncome: number;
            bio: string | null;
            state: string;
            district: string;
            city: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            isVerified: boolean;
            verificationBadge: boolean;
            likesReceived: number;
            profileCompletionPercentage: number;
        }[];
        total: number;
        page: number;
        pages: number;
    }>;
    getPremiumProfiles(userId: string, gender: 'MALE' | 'FEMALE', filters: any, page: number, limit: number): Promise<{
        profiles: {
            user: {
                subscription: {
                    plan: import(".prisma/client").$Enums.SubscriptionPlan;
                    isActive: boolean;
                } | null;
                gender: import(".prisma/client").$Enums.Gender;
                id: string;
                accountStatus: import(".prisma/client").$Enums.AccountStatus;
                lastActive: Date | null;
                photos: {
                    url: string;
                }[];
            };
            firstName: string;
            lastName: string;
            id: string;
            profileViews: number;
            age: number;
            height: number;
            maritalStatus: import(".prisma/client").$Enums.MaritalStatus;
            motherTongue: string;
            religion: string;
            caste: string;
            education: string;
            profession: string;
            annualIncome: number;
            bio: string | null;
            state: string;
            district: string;
            city: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            isVerified: boolean;
            verificationBadge: boolean;
            likesReceived: number;
            profileCompletionPercentage: number;
        }[];
        total: number;
        page: number;
        pages: number;
    }>;
    getVerifiedProfiles(userId: string, gender: 'MALE' | 'FEMALE', filters: any, page: number, limit: number): Promise<{
        profiles: {
            user: {
                subscription: {
                    plan: import(".prisma/client").$Enums.SubscriptionPlan;
                    isActive: boolean;
                } | null;
                gender: import(".prisma/client").$Enums.Gender;
                id: string;
                accountStatus: import(".prisma/client").$Enums.AccountStatus;
                lastActive: Date | null;
                photos: {
                    url: string;
                }[];
            };
            firstName: string;
            lastName: string;
            id: string;
            profileViews: number;
            age: number;
            height: number;
            maritalStatus: import(".prisma/client").$Enums.MaritalStatus;
            motherTongue: string;
            religion: string;
            caste: string;
            education: string;
            profession: string;
            annualIncome: number;
            bio: string | null;
            state: string;
            district: string;
            city: string;
            latitude: import("@prisma/client/runtime/library").Decimal;
            longitude: import("@prisma/client/runtime/library").Decimal;
            isVerified: boolean;
            verificationBadge: boolean;
            likesReceived: number;
            profileCompletionPercentage: number;
        }[];
        total: number;
        page: number;
        pages: number;
    }>;
    likeProfile(fromUserId: string, toUserId: string): Promise<{
        isMatch: boolean;
    }>;
    unlikeProfile(fromUserId: string, toUserId: string): Promise<void>;
    superLikeProfile(fromUserId: string, toUserId: string, message?: string): Promise<void>;
    viewProfile(viewerId: string, viewedId: string): Promise<void>;
    favoriteProfile(userId: string, favoriteUserId: string): Promise<void>;
    unfavoriteProfile(userId: string, favoriteUserId: string): Promise<void>;
    blockUser(blockerId: string, blockedId: string, reason?: string): Promise<void>;
    getLikesReceived(userId: string, page: number, limit: number): Promise<{
        likes: ({
            fromUser: {
                profile: {
                    firstName: string;
                    lastName: string;
                    age: number;
                    profession: string;
                    city: string;
                    isVerified: boolean;
                } | null;
                gender: import(".prisma/client").$Enums.Gender;
                id: string;
                lastActive: Date | null;
                photos: {
                    url: string;
                }[];
            };
        } & {
            id: string;
            createdAt: Date;
            fromUserId: string;
            toUserId: string;
            isMatch: boolean;
            matchedAt: Date | null;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    getLikesSent(userId: string, page: number, limit: number): Promise<{
        likes: ({
            toUser: {
                profile: {
                    firstName: string;
                    lastName: string;
                    age: number;
                    profession: string;
                    city: string;
                    isVerified: boolean;
                } | null;
                gender: import(".prisma/client").$Enums.Gender;
                id: string;
                lastActive: Date | null;
                photos: {
                    url: string;
                }[];
            };
        } & {
            id: string;
            createdAt: Date;
            fromUserId: string;
            toUserId: string;
            isMatch: boolean;
            matchedAt: Date | null;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    getViewedByMe(userId: string, page: number, limit: number): Promise<{
        views: ({
            viewed: {
                profile: {
                    firstName: string;
                    lastName: string;
                    age: number;
                    profession: string;
                    city: string;
                    isVerified: boolean;
                } | null;
                gender: import(".prisma/client").$Enums.Gender;
                id: string;
                lastActive: Date | null;
                photos: {
                    url: string;
                }[];
            };
        } & {
            id: string;
            createdAt: Date;
            viewerId: string;
            viewedId: string;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    getFavorites(userId: string, page: number, limit: number): Promise<{
        favorites: ({
            favoriteUser: {
                profile: {
                    firstName: string;
                    lastName: string;
                    age: number;
                    profession: string;
                    city: string;
                    isVerified: boolean;
                } | null;
                gender: import(".prisma/client").$Enums.Gender;
                id: string;
                lastActive: Date | null;
                photos: {
                    url: string;
                }[];
            };
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            favoriteUserId: string;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
}
//# sourceMappingURL=match.service.d.ts.map