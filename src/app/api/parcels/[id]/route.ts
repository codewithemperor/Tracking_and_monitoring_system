import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

async function handler(req: AuthenticatedRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  try {
    if (req.method === 'GET') {
      const parcel = await db.parcel.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
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
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!parcel) {
        return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
      }

      return NextResponse.json({ parcel });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      const { 
        origin, 
        destination, 
        status, 
        currentLocation, 
        weight, 
        value, 
        description, 
        estimatedDelivery,
        userId,
        staffId 
      } = body;

      // Check if parcel exists
      const existingParcel = await db.parcel.findUnique({
        where: { id },
      });

      if (!existingParcel) {
        return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
      }

      // Update parcel
      const updatedParcel = await db.parcel.update({
        where: { id },
        data: {
          ...(origin && { origin }),
          ...(destination && { destination }),
          ...(status && { status }),
          ...(currentLocation !== undefined && { currentLocation }),
          ...(weight !== undefined && { weight }),
          ...(value !== undefined && { value }),
          ...(description !== undefined && { description }),
          ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
          ...(userId && { userId }),
          ...(staffId !== undefined && { staffId }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
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

      // If status changed, add to status history
      if (status && status !== existingParcel.status) {
        await db.statusHistory.create({
          data: {
            parcelId: id,
            status: status as any,
            location: currentLocation || existingParcel.currentLocation || 'System',
            description: `Status updated to ${status}`,
            updatedBy: req.user!.userId,
          },
        });
      }

      return NextResponse.json({ parcel: updatedParcel });
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    console.error('Parcel API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
export const PUT = withAuth(handler);