import { prisma } from '../config/database.js';
import { VenueStage, VenueStatus, VenueType, InteractionType } from '@prisma/client';

export const analyticsService = {
  // Pipeline metrics - deals by stage, value by stage
  async getPipelineMetrics() {
    const venues = await prisma.venue.findMany({
      select: { stage: true, dealValue: true, status: true },
    });

    const byStage = Object.values(VenueStage).reduce((acc, stage) => {
      const stageVenues = venues.filter(v => v.stage === stage);
      acc[stage] = {
        count: stageVenues.length,
        value: stageVenues.reduce((sum, v) => sum + (v.dealValue || 0), 0),
      };
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    const totalValue = venues.reduce((sum, v) => sum + (v.dealValue || 0), 0);
    const openDeals = venues.filter(v =>
      v.stage !== 'closed_won' && v.stage !== 'closed_lost'
    ).length;
    const closedWon = venues.filter(v => v.stage === 'closed_won').length;
    const closedLost = venues.filter(v => v.stage === 'closed_lost').length;

    const conversionRate = openDeals + closedWon + closedLost > 0
      ? (closedWon / (closedWon + closedLost)) * 100
      : 0;

    return {
      byStage,
      totalValue,
      openDeals,
      closedWon,
      closedLost,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  },

  // Pipeline trends over time (weekly/monthly)
  async getPipelineTrends(period: 'weekly' | 'monthly' = 'monthly', months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const venues = await prisma.venue.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, stage: true, dealValue: true },
    });

    // Group by period
    const trends: Record<string, { created: number; value: number }> = {};

    venues.forEach(v => {
      const date = v.createdAt;
      let key: string;

      if (period === 'weekly') {
        const week = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        key = `Week ${week + 1}`;
      } else {
        key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      }

      if (!trends[key]) {
        trends[key] = { created: 0, value: 0 };
      }
      const trendEntry = trends[key]!;
      trendEntry.created++;
      trendEntry.value += v.dealValue || 0;
    });

    return trends;
  },

  // Revenue metrics
  async getRevenueMetrics() {
    const closedWonVenues = await prisma.venue.findMany({
      where: { stage: 'closed_won' },
      include: { operator: { select: { id: true, name: true } } },
    });

    const totalRevenue = closedWonVenues.reduce((sum, v) => sum + (v.dealValue || 0), 0);

    // Revenue by operator
    const byOperator: Record<string, { name: string; value: number }> = {};
    closedWonVenues.forEach(v => {
      if (v.operator) {
        if (!byOperator[v.operator.id]) {
          byOperator[v.operator.id] = { name: v.operator.name, value: 0 };
        }
        const operatorEntry = byOperator[v.operator.id]!;
        operatorEntry.value += v.dealValue || 0;
      }
    });

    return {
      totalRevenue,
      closedDeals: closedWonVenues.length,
      averageDealSize: closedWonVenues.length > 0
        ? Math.round(totalRevenue / closedWonVenues.length)
        : 0,
      byOperator: Object.values(byOperator),
    };
  },

  // Revenue forecast based on probability
  async getRevenueForecast() {
    const stageProbabilities: Record<string, number> = {
      lead: 0.1,
      qualified: 0.2,
      demo: 0.4,
      proposal: 0.6,
      negotiation: 0.8,
      closed_won: 1.0,
      closed_lost: 0,
    };

    const openVenues = await prisma.venue.findMany({
      where: {
        stage: { notIn: ['closed_won', 'closed_lost'] },
      },
      select: { stage: true, dealValue: true },
    });

    const weightedForecast = openVenues.reduce((sum, v) => {
      const probability = stageProbabilities[v.stage] || 0;
      return sum + (v.dealValue || 0) * probability;
    }, 0);

    const totalPipeline = openVenues.reduce((sum, v) => sum + (v.dealValue || 0), 0);

    return {
      weightedForecast: Math.round(weightedForecast),
      totalPipeline,
      openDeals: openVenues.length,
    };
  },

  // Activity metrics - interactions over time
  async getActivityMetrics(months = 3) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const interactions = await prisma.interaction.findMany({
      where: { date: { gte: startDate } },
      select: { type: true, date: true, userId: true },
    });

    // By type
    const byType = Object.values(InteractionType).reduce((acc, type) => {
      acc[type] = interactions.filter(i => i.type === type).length;
      return acc;
    }, {} as Record<string, number>);

    // By month
    const byMonth: Record<string, number> = {};
    interactions.forEach(i => {
      const key = i.date.toLocaleString('default', { month: 'short', year: '2-digit' });
      byMonth[key] = (byMonth[key] || 0) + 1;
    });

    return {
      total: interactions.length,
      byType,
      byMonth,
    };
  },

  // Activity by user
  async getActivityByUser(months = 3) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const interactions = await prisma.interaction.findMany({
      where: { date: { gte: startDate } },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    const byUser: Record<string, { user: { id: string; name: string; avatar: string | null }; count: number; byType: Record<string, number> }> = {};

    interactions.forEach(i => {
      if (!byUser[i.userId]) {
        byUser[i.userId] = {
          user: i.user,
          count: 0,
          byType: {},
        };
      }
      const userEntry = byUser[i.userId]!;
      userEntry.count++;
      userEntry.byType[i.type] = (userEntry.byType[i.type] || 0) + 1;
    });

    return Object.values(byUser).sort((a, b) => b.count - a.count);
  },

  // User performance metrics
  async getPerformanceMetrics() {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, avatar: true },
    });

    const performance = await Promise.all(
      users.map(async (user) => {
        // Get assigned venues that are closed won
        const closedDeals = await prisma.venue.count({
          where: {
            assignedUsers: { some: { userId: user.id } },
            stage: 'closed_won',
          },
        });

        // Get interaction count (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const interactions = await prisma.interaction.count({
          where: {
            userId: user.id,
            date: { gte: thirtyDaysAgo },
          },
        });

        // Get completed todos (last 30 days)
        const completedTodos = await prisma.todo.count({
          where: {
            assignedToId: user.id,
            completed: true,
            updatedAt: { gte: thirtyDaysAgo },
          },
        });

        return {
          user: { id: user.id, name: user.name, avatar: user.avatar },
          closedDeals,
          interactions,
          completedTodos,
        };
      })
    );

    return performance.sort((a, b) => b.closedDeals - a.closedDeals);
  },

  // Venues by type distribution
  async getVenuesByType() {
    const venues = await prisma.venue.groupBy({
      by: ['type'],
      _count: true,
    });

    return venues.map(v => ({
      type: v.type,
      count: v._count,
    }));
  },

  // Venues by status distribution
  async getVenuesByStatus() {
    const venues = await prisma.venue.groupBy({
      by: ['status'],
      _count: true,
    });

    return venues.map(v => ({
      status: v.status,
      count: v._count,
    }));
  },
};
