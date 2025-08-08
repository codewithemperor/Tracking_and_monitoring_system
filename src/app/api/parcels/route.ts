import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ParcelStatus } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { generateTrackingId } from '@/lib/utils/tracking';
import { z } from 'zod';

const createParcelSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  weight: z.number().positive().optional(),
  dimensions: z.string().optional(),
  description: z.string().optional(),
  estimatedDelivery: z.string().optional(),
});

async function handler(req: AuthenticatedRequest) {
  try {
    if (req.method === 'POST') {
      const body = await req.json();
      const { origin, destination, weight, dimensions, description, estimatedDelivery } = createParcelSchema.parse(body);

      // Generate unique tracking ID
      const trackingId = generateTrackingId();

      // Create parcel
      const parcel = await db.parcel.create({
        data: {
          trackingId,
          userId: req.user!.userId,
          origin,
          destination,
          weight,
          dimensions,
          description,
          estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        },
        include: {
          user: {
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

      // Create initial status history
      await db.statusHistory.create({
        data: {
          parcelId: parcel.id,
          status: ParcelStatus.PENDING,
          location: origin,
          description: 'Parcel registered and awaiting dispatch',
          updatedBy: req.user!.userId,
        },
      });

      return NextResponse.json({
        message: 'Parcel created successfully',
        parcel,
      });
    }

    if (req.method === 'GET') {
      const searchParams = new URL(req.url).searchParams;
      const search = searchParams.get('search') || '';
      const status = searchParams.get('status') || '';
      const page = Number(searchParams.get('page')) || 1;
      const limit = Number(searchParams.get('limit')) || 10;
      
      const skip = (page - 1) * limit;
      
      const where: any = {};

      // If user is admin, show all parcels, otherwise show only user's parcels
      if (req.user!.role === 'ADMIN') {
        // Admin can see all parcels
        if (search) {
          where.OR = [
            { trackingId: { contains: search, mode: 'insensitive' } },
            { origin: { contains: search, mode: 'insensitive' } },
            { destination: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ];
        }
      } else {
        // Regular users can only see their own parcels
        where.userId = req.user!.userId;
        
        if (search) {
          where.OR = [
            { trackingId: { contains: search, mode: 'insensitive' } },
            { origin: { contains: search, mode: 'insensitive' } },
            { destination: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ];
        }
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
          orderBy: {
            createdAt: 'desc',
          },
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

    console.error('Parcels API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);