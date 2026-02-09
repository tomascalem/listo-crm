import { prisma } from '../config/database.js';
import { ApiError } from '../utils/apiResponse.js';

export const dashboardService = {
  // Get today's scheduled events for user
  async getSchedule(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.scheduledEvent.findMany({
      where: {
        userId,
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { startTime: 'asc' },
      include: {
        venue: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
      },
    });
  },

  // Get user's incomplete todos
  async getTodos(userId: string, limit = 10) {
    return prisma.todo.findMany({
      where: {
        OR: [
          { assignedToId: userId },
          { sharedWith: { some: { userId } } },
        ],
        completed: false,
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
      take: limit,
      include: {
        venue: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
      },
    });
  },

  // Get recommended actions for user
  async getRecommendedActions(userId: string) {
    return prisma.recommendedAction.findMany({
      where: {
        userId,
        dismissed: false,
        completedAt: null,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        venue: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
      },
    });
  },

  // Dismiss a recommended action
  async dismissAction(id: string, userId: string) {
    const action = await prisma.recommendedAction.findUnique({ where: { id } });
    if (!action) {
      throw new ApiError(404, 'Recommended action not found');
    }
    if (action.userId !== userId) {
      throw new ApiError(403, 'Not authorized to modify this action');
    }

    return prisma.recommendedAction.update({
      where: { id },
      data: { dismissed: true },
    });
  },

  // Mark a recommended action as complete
  async completeAction(id: string, userId: string) {
    const action = await prisma.recommendedAction.findUnique({ where: { id } });
    if (!action) {
      throw new ApiError(404, 'Recommended action not found');
    }
    if (action.userId !== userId) {
      throw new ApiError(403, 'Not authorized to modify this action');
    }

    return prisma.recommendedAction.update({
      where: { id },
      data: { completedAt: new Date() },
    });
  },

  // Get business insights
  async getInsights(userId: string) {
    // Get insights for venues assigned to the user or global insights (no venue)
    const assignedVenueIds = await prisma.venueAssignment.findMany({
      where: { userId },
      select: { venueId: true },
    });
    const venueIds = assignedVenueIds.map(v => v.venueId);

    return prisma.businessInsight.findMany({
      where: {
        OR: [
          { venueId: { in: venueIds } },
          { venueId: null },
        ],
        read: false,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        venue: { select: { id: true, name: true } },
        operator: { select: { id: true, name: true } },
      },
    });
  },

  // Mark insight as read
  async markInsightRead(id: string) {
    const insight = await prisma.businessInsight.findUnique({ where: { id } });
    if (!insight) {
      throw new ApiError(404, 'Business insight not found');
    }

    return prisma.businessInsight.update({
      where: { id },
      data: { read: true },
    });
  },

  // Get quick pipeline stats
  async getStats(userId: string) {
    // Get venues assigned to user
    const assignedVenues = await prisma.venueAssignment.findMany({
      where: { userId },
      select: { venueId: true },
    });
    const venueIds = assignedVenues.map(v => v.venueId);

    // Get all venues for this user
    const venues = await prisma.venue.findMany({
      where: { id: { in: venueIds } },
      select: { stage: true, status: true, dealValue: true },
    });

    // Calculate stats
    const totalVenues = venues.length;
    const totalDealValue = venues.reduce((sum, v) => sum + (v.dealValue || 0), 0);

    const byStage = venues.reduce((acc, v) => {
      acc[v.stage] = (acc[v.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = venues.reduce((acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get overdue todos count
    const overdueTodos = await prisma.todo.count({
      where: {
        OR: [
          { assignedToId: userId },
          { sharedWith: { some: { userId } } },
        ],
        completed: false,
        dueDate: { lt: new Date() },
      },
    });

    // Get upcoming meetings (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingMeetings = await prisma.scheduledEvent.count({
      where: {
        userId,
        startTime: {
          gte: new Date(),
          lt: nextWeek,
        },
      },
    });

    return {
      totalVenues,
      totalDealValue,
      byStage,
      byStatus,
      overdueTodos,
      upcomingMeetings,
    };
  },
};
