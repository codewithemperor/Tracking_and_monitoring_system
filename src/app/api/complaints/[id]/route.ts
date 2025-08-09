import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { UserRole } from '@prisma/client';

interface User {
  id: string;
  email: string;
  role: UserRole;
}

async function getSession(request: NextRequest): Promise<{ user: User } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    return {
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      },
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const complaint = await db.complaint.findUnique({
      where: { id },
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
        parcel: {
          select: {
            trackingId: true,
            origin: true,
            destination: true,
            status: true,
          },
        },
        responses: {
          include: {
            staff: {
              select: {
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Check if user has permission to view this complaint
    if (session.user.role === 'CUSTOMER' && complaint.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSession(request);
    if (!session || (session.user.role !== 'STAFF' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, staffId, resolution, escalated } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (staffId) updateData.staffId = staffId;
    if (resolution) updateData.resolution = resolution;
    if (escalated) updateData.escalatedAt = new Date();
    if (status === 'RESOLVED') updateData.resolvedAt = new Date();

    const complaint = await db.complaint.update({
      where: { id },
      data: updateData,
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
        parcel: {
          select: {
            trackingId: true,
            origin: true,
            destination: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSession(request);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.complaint.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}