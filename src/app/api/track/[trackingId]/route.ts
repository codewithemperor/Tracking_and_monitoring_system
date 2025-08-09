import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateTrackingId } from '@/lib/utils/tracking';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;

    // Validate tracking ID format
    if (!validateTrackingId(trackingId)) {
      return NextResponse.json(
        { error: 'Invalid tracking ID format' },
        { status: 400 }
      );
    }

    // Find parcel by tracking ID
    const parcel = await db.parcel.findUnique({
      where: { trackingId },
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
        },
        proofOfDelivery: true,
      },
    });

    if (!parcel) {
      return NextResponse.json(
        { error: 'Parcel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      parcel,
    });
  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}