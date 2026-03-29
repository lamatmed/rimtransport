import { convex } from './convex';
import { api } from '../../convex/_generated/api';

export const notificationService = {
  async getUserNotifications(userId: any) {
    return await convex.query(api.notifications.getUserNotifications, { userId });
  },

  async markAsRead(id: any) {
    return await (convex as any).mutation(api.notifications.markAsRead, { id });
  },

  async markAllAsRead(userId: any) {
    return await (convex as any).mutation(api.notifications.markAllAsRead, { userId });
  },

  async getNotificationById(id: any) {
    return await convex.query(api.notifications.getNotificationById, { id });
  }
};
