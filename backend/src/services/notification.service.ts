import prisma from '@config/prisma';
import { NotificationType } from '@prisma/client';
import logger from '@utils/logger';

export interface PushNotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, any>;
}

export class NotificationService {
  async create(
    userId: string,
    type: NotificationType,
    payload: PushNotificationPayload
  ) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          type,
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
          data: payload.data,
        },
      });
    } catch (err) {
      logger.error('Failed to create notification', err);
      return null;
    }
  }

  async getNotifications(userId: string, page: number, limit: number) {
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount, page, pages: Math.ceil(total / limit) };
  }

  async markRead(userId: string, notificationIds?: string[]) {
    await prisma.notification.updateMany({
      where: {
        userId,
        ...(notificationIds ? { id: { in: notificationIds } } : {}),
      },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async deleteNotification(userId: string, notificationId: string) {
    await prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }
}
