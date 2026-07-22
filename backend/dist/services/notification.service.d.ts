import { NotificationType } from '@prisma/client';
export interface PushNotificationPayload {
    title: string;
    body: string;
    imageUrl?: string;
    data?: Record<string, any>;
}
export declare class NotificationService {
    create(userId: string, type: NotificationType, payload: PushNotificationPayload): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        body: string;
        title: string;
        imageUrl: string | null;
        isRead: boolean;
        readAt: Date | null;
    } | null>;
    getNotifications(userId: string, page: number, limit: number): Promise<{
        notifications: {
            userId: string;
            id: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            type: import(".prisma/client").$Enums.NotificationType;
            body: string;
            title: string;
            imageUrl: string | null;
            isRead: boolean;
            readAt: Date | null;
        }[];
        total: number;
        unreadCount: number;
        page: number;
        pages: number;
    }>;
    markRead(userId: string, notificationIds?: string[]): Promise<void>;
    markAllRead(userId: string): Promise<void>;
    deleteNotification(userId: string, notificationId: string): Promise<void>;
}
//# sourceMappingURL=notification.service.d.ts.map