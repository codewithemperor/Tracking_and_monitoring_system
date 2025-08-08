import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

async function handler(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    if (req.method === 'GET') {
      // Get current date and date 30 days ago
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get user statistics
      const [totalUsers, newUsersLast30Days, usersByRole] = await Promise.all([
        db.user.count(),
        db.user.count({
          where: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        }),
        db.user.groupBy({
          by: ['role'],
          _count: {
            role: true,
          },
        }),
      ]);

      // Get parcel statistics
      const [totalParcels, newParcelsLast30Days, parcelsByStatus, parcelsByMonth] = await Promise.all([
        db.parcel.count(),
        db.parcel.count({
          where: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        }),
        db.parcel.groupBy({
          by: ['status'],
          _count: {
            status: true,
          },
        }),
        db.parcel.findMany({
          select: {
            createdAt: true,
            status: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        }),
      ]);

      // Calculate delivery metrics
      const deliveredParcels = await db.parcel.count({
        where: {
          status: 'DELIVERED',
        },
      });

      const parcelsWithDeliveryTime = await db.parcel.findMany({
        where: {
          status: 'DELIVERED',
          actualDelivery: {
            not: null,
          },
        },
        select: {
          createdAt: true,
          actualDelivery: true,
        },
      });

      // Calculate average delivery time
      const deliveryTimes = parcelsWithDeliveryTime.map(parcel => {
        const created = new Date(parcel.createdAt).getTime();
        const delivered = new Date(parcel.actualDelivery!).getTime();
        return (delivered - created) / (1000 * 60 * 60 * 24); // Convert to days
      });

      const averageDeliveryTime = deliveryTimes.length > 0 
        ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
        : 0;

      // Get monthly data for the last 6 months
      const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      const monthlyData = await db.parcel.findMany({
        where: {
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
        select: {
          createdAt: true,
          status: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Group by month
      const monthlyStats = {};
      monthlyData.forEach(parcel => {
        const month = new Date(parcel.createdAt).toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyStats[month]) {
          monthlyStats[month] = {
            total: 0,
            delivered: 0,
          };
        }
        monthlyStats[month].total++;
        if (parcel.status === 'DELIVERED') {
          monthlyStats[month].delivered++;
        }
      });

      // Get staff performance
      const staffPerformance = await db.user.findMany({
        where: {
          role: UserRole.STAFF,
        },
        select: {
          id: true,
          name: true,
          email: true,
          assignedParcels: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              actualDelivery: true,
            },
          },
        },
      });

      const staffStats = staffPerformance.map(staff => {
        const assignedParcels = staff.assignedParcels;
        const deliveredParcels = assignedParcels.filter(p => p.status === 'DELIVERED');
        const inProgressParcels = assignedParcels.filter(p => 
          ['DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(p.status)
        );

        // Calculate average delivery time for this staff
        const staffDeliveryTimes = deliveredParcels
          .filter(p => p.actualDelivery)
          .map(parcel => {
            const created = new Date(parcel.createdAt).getTime();
            const delivered = new Date(parcel.actualDelivery!).getTime();
            return (delivered - created) / (1000 * 60 * 60 * 24);
          });

        const avgDeliveryTime = staffDeliveryTimes.length > 0 
          ? staffDeliveryTimes.reduce((sum, time) => sum + time, 0) / staffDeliveryTimes.length 
          : 0;

        return {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          totalAssigned: assignedParcels.length,
          delivered: deliveredParcels.length,
          inProgress: inProgressParcels.length,
          completionRate: assignedParcels.length > 0 
            ? (deliveredParcels.length / assignedParcels.length) * 100 
            : 0,
          averageDeliveryTime: avgDeliveryTime,
        };
      });

      // Get notification statistics
      const [totalNotifications, pendingNotifications, sentNotifications] = await Promise.all([
        db.notification.count(),
        db.notification.count({
          where: {
            status: 'PENDING',
          },
        }),
        db.notification.count({
          where: {
            status: 'SENT',
          },
        }),
      ]);

      return NextResponse.json({
        userStats: {
          total: totalUsers,
          newLast30Days: newUsersLast30Days,
          byRole: usersByRole.reduce((acc, item) => {
            acc[item.role] = item._count.role;
            return acc;
          }, {} as Record<string, number>),
        },
        parcelStats: {
          total: totalParcels,
          newLast30Days: newParcelsLast30Days,
          byStatus: parcelsByStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {} as Record<string, number>),
          delivered: deliveredParcels,
          averageDeliveryTime: Math.round(averageDeliveryTime * 100) / 100,
        },
        monthlyStats: Object.entries(monthlyStats).map(([month, stats]) => ({
          month,
          total: stats.total,
          delivered: stats.delivered,
          deliveryRate: stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0,
        })),
        staffPerformance: staffStats.sort((a, b) => b.completionRate - a.completionRate),
        notificationStats: {
          total: totalNotifications,
          pending: pendingNotifications,
          sent: sentNotifications,
        },
      });
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);