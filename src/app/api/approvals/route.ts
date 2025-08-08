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

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || (session.user.role !== 'STAFF' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereClause: any = {};
    if (status) whereClause.status = status;

    const approvals = await db.approvalQueue.findMany({
      where: whereClause,
      include: {
        parcel: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        rejecter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    return NextResponse.json({ approvals });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { parcelId, action, reason } = body;

    if (!parcelId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if parcel exists and user has permission
    const parcel = await db.parcel.findUnique({
      where: { id: parcelId },
      include: { user: true },
    });

    if (!parcel) {
      return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
    }

    // Check if user owns the parcel or is staff/admin
    if (session.user.role === 'CUSTOMER' && parcel.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (action === 'REQUEST_APPROVAL') {
      // Create approval request
      const existingApproval = await db.approvalQueue.findUnique({
        where: { parcelId },
      });

      if (existingApproval) {
        return NextResponse.json({ error: 'Approval already requested' }, { status: 400 });
      }

      const approval = await db.approvalQueue.create({
        data: {
          parcelId,
          requestedBy: session.user.id,
        },
        include: {
          parcel: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update parcel status to pending approval
      await db.parcel.update({
        where: { id: parcelId },
        data: { status: 'PENDING_APPROVAL' },
      });

      return NextResponse.json({ approval });
    } else if (action === 'APPROVE' || action === 'REJECT') {
      // Handle approval/rejection (only for staff/admin)
      if (session.user.role === 'CUSTOMER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const approval = await db.approvalQueue.findUnique({
        where: { parcelId },
      });

      if (!approval) {
        return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
      }

      if (approval.status !== 'PENDING') {
        return NextResponse.json({ error: 'Approval already processed' }, { status: 400 });
      }

      const updateData: any = {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      };

      if (action === 'APPROVE') {
        updateData.approvedBy = session.user.id;
        updateData.approvedAt = new Date();
      } else {
        updateData.rejectedBy = session.user.id;
        updateData.rejectedAt = new Date();
        updateData.rejectionReason = reason;
      }

      const updatedApproval = await db.approvalQueue.update({
        where: { id: approval.id },
        data: updateData,
        include: {
          parcel: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          rejecter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update parcel status
      await db.parcel.update({
        where: { id: parcelId },
        data: { 
          status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        },
      });

      // Create notification for the parcel owner
      await db.notification.create({
        data: {
          userId: parcel.userId,
          message: `Your parcel ${action === 'APPROVE' ? 'has been approved' : 'was rejected'}`,
          type: 'EMAIL',
          status: 'PENDING',
        },
      });

      return NextResponse.json({ approval: updatedApproval });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}