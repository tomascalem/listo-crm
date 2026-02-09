import { prisma } from '../config/database.js';
import { ApiError, parsePagination, paginatedResponse } from '../utils/apiResponse.js';
import { NotificationType } from '@prisma/client';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

export const notificationService = {
  // Get all notifications for user
  async findAll(userId: string, query: {
    unreadOnly?: string;
    page?: string;
    limit?: string;
  }) {
    const { page, limit, skip } = parsePagination(query);

    const where: Record<string, unknown> = { userId };

    if (query.unreadOnly === 'true') {
      where.read = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return paginatedResponse(notifications, total, page, limit);
  },

  // Get unread count
  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, read: false },
    });
    return { unreadCount: count };
  },

  // Mark notification as read
  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ApiError(403, 'Not authorized');
    }

    return prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { marked: result.count };
  },

  // Delete notification
  async delete(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ApiError(403, 'Not authorized');
    }

    return prisma.notification.delete({ where: { id } });
  },

  // Create notification (internal use)
  async create(input: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        entityType: input.entityType,
        entityId: input.entityId,
      },
    });
  },

  // Helper: Create venue assignment notification
  async notifyVenueAssignment(userId: string, venueName: string, venueId: string) {
    return this.create({
      userId,
      type: 'assignment',
      title: 'New Venue Assignment',
      message: `You were assigned to ${venueName}`,
      entityType: 'venue',
      entityId: venueId,
    });
  },

  // Helper: Create todo assignment notification
  async notifyTodoAssignment(userId: string, todoTitle: string, todoId: string) {
    return this.create({
      userId,
      type: 'assignment',
      title: 'New Task Assigned',
      message: `New task: ${todoTitle}`,
      entityType: 'todo',
      entityId: todoId,
    });
  },

  // Helper: Create todo shared notification
  async notifyTodoShared(userId: string, sharedByName: string, todoTitle: string, todoId: string) {
    return this.create({
      userId,
      type: 'mention',
      title: 'Task Shared With You',
      message: `${sharedByName} shared a task with you: ${todoTitle}`,
      entityType: 'todo',
      entityId: todoId,
    });
  },

  // Helper: Create due date reminder notification
  async notifyDueDateReminder(userId: string, todoTitle: string, todoId: string) {
    return this.create({
      userId,
      type: 'due_date',
      title: 'Task Due Tomorrow',
      message: `Task due tomorrow: ${todoTitle}`,
      entityType: 'todo',
      entityId: todoId,
    });
  },
};
