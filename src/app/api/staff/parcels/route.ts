import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ParcelStatus, UserRole } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { z } from 'zod';

const updateStatusSchema = z.object({
  parcelId: z.string(),
  status: z.enum(['PENDING', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
  location: z.string().min(1),
  description: z.string().optional(),
  currentLocation: z.string().optional(),
});

const assignParcelSchema = z.object({
  parcelId: z.string(),
});

async function handler(req: AuthenticatedRequest) {
  try {
    // Check if user is staff or admin
    if (req.user!.role !== UserRole.STAFF && req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Access denied. Staff or admin role required.' },
        { status: 403 }
      );
    }

    if (req.method === 'GET') {
      const searchParams = new URL(req.url).searchParams;
      const status = searchParams.get('status') || '';
      const page = Number(searchParams.get('page')) || 1;
      const limit = Number(searchParams.get('limit')) || 10;
      
      const skip = (page - 1) * limit;
      
      const where: any = {};

      // If user is staff, only show assigned parcels
      if (req.user!.role === UserRole.STAFF) {
        where.staffId = req.user!.userId;
      }

      if (status && Object.values(ParcelStatus).includes(status as ParcelStatus)) {
        where.status = status as ParcelStatus;
      }

      const [parcels, total] = await Promise.all([
        db.parcel.findMany({
          where,
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
            proofOfDelivery: true,
          },
          orderBy: [
            { status: 'asc' },
            { createdAt: 'desc' },
          ],
          skip,
          take: Number(limit),
        }),
        db.parcel.count({ where }),
      ]);

      return NextResponse.json({
        parcels,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { parcelId, status, location, description, currentLocation } = updateStatusSchema.parse(body);

      // Check if parcel exists and user has permission
      const parcel = await db.parcel.findUnique({
        where: { id: parcelId },
        include: {
          user: true,
          staff: true,
        },
      });

      if (!parcel) {
        return NextResponse.json(
          { error: 'Parcel not found' },
          { status: 404 }
        );
      }

      // Check if staff is assigned to this parcel or if user is admin
      if (req.user!.role === UserRole.STAFF && parcel.staffId !== req.user!.userId) {
        return NextResponse.json(
          { error: 'Access denied. You are not assigned to this parcel.' },
          { status: 403 }
        );
      }

      // Update parcel status
      const updatedParcel = await db.parcel.update({
        where: { id: parcelId },
        data: {
          status,
          currentLocation: currentLocation || location,
          actualDelivery: status === ParcelStatus.DELIVERED ? new Date() : null,
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
          proofOfDelivery: true,
        },
      });

      // Create status history entry
      await db.statusHistory.create({
        data: {
          parcelId,
          status,
          location,
          description,
          updatedBy: req.user!.userId,
        },
      });

      // Create notification for user
      await db.notification.create({
        data: {
          userId: parcel.userId,
          parcelId,
          message: `Your parcel status has been updated to: ${status.replace('_', ' ')}`,
          type: 'EMAIL',
          status: 'PENDING',
        },
      });

      return NextResponse.json({
        message: 'Parcel status updated successfully',
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

    console.error('Staff parcels API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);