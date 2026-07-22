"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = __importDefault(require("@config/prisma"));
const logger_1 = __importDefault(require("@utils/logger"));
class NotificationService {
    async create(userId, type, payload) {
        try {
            return await prisma_1.default.notification.create({
                data: {
                    userId,
                    type,
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.imageUrl,
                    data: payload.data,
                },
            });
        }
        catch (err) {
            logger_1.default.error('Failed to create notification', err);
            return null;
        }
    }
    async getNotifications(userId, page, limit) {
        const [notifications, total, unreadCount] = await Promise.all([
            prisma_1.default.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.notification.count({ where: { userId } }),
            prisma_1.default.notification.count({ where: { userId, isRead: false } }),
        ]);
        return { notifications, total, unreadCount, page, pages: Math.ceil(total / limit) };
    }
    async markRead(userId, notificationIds) {
        await prisma_1.default.notification.updateMany({
            where: {
                userId,
                ...(notificationIds ? { id: { in: notificationIds } } : {}),
            },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async markAllRead(userId) {
        await prisma_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async deleteNotification(userId, notificationId) {
        await prisma_1.default.notification.deleteMany({
            where: { id: notificationId, userId },
        });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map