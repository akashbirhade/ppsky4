type HostStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export declare const createHost: (data: {
    name: string;
    mobile: string;
    email: string;
    region: string;
    district: string;
    city: string;
    community?: string;
    profilePhoto?: string;
}) => Promise<any>;
export declare const getHosts: (filters: {
    region?: string;
    district?: string;
    city?: string;
    status?: HostStatus;
    page?: number;
    limit?: number;
}) => Promise<{
    hosts: any;
    total: any;
    page: number;
    totalPages: number;
}>;
export declare const getHostById: (id: string) => Promise<any>;
export declare const updateHost: (id: string, data: Partial<{
    name: string;
    mobile: string;
    email: string;
    region: string;
    district: string;
    city: string;
    community: string;
    profilePhoto: string;
    status: HostStatus;
}>) => Promise<any>;
export declare const deleteHost: (id: string) => Promise<any>;
export declare const assignMember: (hostId: string, userId: string) => Promise<any>;
export declare const removeMember: (hostId: string, userId: string) => Promise<any>;
export declare const transferMember: (fromHostId: string, toHostId: string, userId: string) => Promise<[any, any]>;
export declare const getHostMembers: (hostId: string, filters: {
    gender?: string;
    page?: number;
    limit?: number;
}) => Promise<{
    members: any;
    total: any;
    page: number;
    totalPages: number;
}>;
export declare const createHostEvent: (data: {
    hostId: string;
    title: string;
    description?: string;
    date: Date;
    venue: string;
    fee?: number;
    maxParticipants?: number;
}) => Promise<any>;
export declare const getHostEvents: (hostId: string) => Promise<any>;
export declare const updateHostEvent: (eventId: string, data: Partial<{
    title: string;
    description: string;
    date: Date;
    venue: string;
    fee: number;
    maxParticipants: number;
    isActive: boolean;
}>) => Promise<any>;
export declare const deleteHostEvent: (eventId: string) => Promise<any>;
export declare const createInterest: (data: {
    hostId: string;
    fromUserId: string;
    toUserId: string;
    note?: string;
}) => Promise<any>;
export declare const getHostInterests: (hostId: string, status?: string) => Promise<any>;
export declare const updateInterestStatus: (interestId: string, status: string) => Promise<any>;
export declare const getHostStats: (hostId: string) => Promise<{
    totalMembers: any;
    pendingInterests: any;
    upcomingEvents: any;
}>;
export {};
//# sourceMappingURL=host.service.d.ts.map