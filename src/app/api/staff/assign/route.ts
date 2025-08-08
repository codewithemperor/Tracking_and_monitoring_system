import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { z } from 'zod';

const assignParcelSchema = z.object({
  parcelId: z.string(),
  staffId: z.string(),
});

async function handler(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { parcelId, staffId } = assignParcelSchema.parse(body);

      // Check if parcel exists
      const parcel = await db.parcel.findUnique({
        where: { id: parcelId },
      });

      if (!parcel) {
        return NextResponse.json(
          { error: 'Parcel not found' },
          { status: 404 }
        );
      }

      // Check if staff exists and has staff role
      const staff = await db.user.findUnique({
        where: { id: staffId },
      });

      if (!staff || staff.role !== UserRole.STAFF) {
        return NextResponse.json(
          { error: 'Invalid staff member' },
          { status: 400 }
        );
      }

      // Assign parcel to staff
      const updatedParcel = await db.parcel.update({
        where: { id: parcelId },
        data: {
          staffId,
          status: 'DISPATCHED', // Update status when assigned
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          statusHistory: {
            orderBy: {
              timestamp: 'desc',
            },
            take: 1,
          },
        },
      });

      // Create status history entry
      await db.statusHistory.create({
        data: {
          parcelId,
          status: 'DISPATCHED',
          location: parcel.origin,
          description: `Parcel assigned to ${staff.name}`,
          updatedBy: req.user!.userId,
        },
      });

      // Create notification for user
      await db.notification.create({
        data: {
          userId: parcel.userId,
          parcelId,
          message: `Your parcel has been dispatched and assigned to a delivery agent`,
          type: 'EMAIL',
          status: 'PENDING',
        },
      });

      // Create notification for staff
      await db.notification.create({
        data: {
          userId: staffId,
          parcelId,
          message: `New parcel assigned to you for delivery`,
          type: 'EMAIL',
          status: 'PENDING',
        },
      });

      return NextResponse.json({
        message: 'Parcel assigned successfully',
        parcel: updatedParcel,
      });
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Staff assign API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);