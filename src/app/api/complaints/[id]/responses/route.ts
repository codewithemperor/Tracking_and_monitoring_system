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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, isInternal } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check if complaint exists and user has permission
    const complaint = await db.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Check permissions:
    // - CUSTOMER can only respond to their own complaints
    // - STAFF and ADMIN can respond to any complaint
    if (session.user.role === 'CUSTOMER' && complaint.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only staff/admin can create internal responses
    if (isInternal && session.user.role === 'CUSTOMER') {
      return NextResponse.json({ error: 'Customers cannot create internal responses' }, { status: 403 });
    }

    const response = await db.complaintResponse.create({
      data: {
        complaintId: id,
        staffId: session.user.id, // This field name is misleading - it works for both staff and customers
        message,
        isInternal: isInternal || false,
      },
      include: {
        staff: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    // Update complaint status if it's still OPEN and response is from staff
    if (complaint.status === 'OPEN' && (session.user.role === 'STAFF' || session.user.role === 'ADMIN')) {
      await db.complaint.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          staffId: session.user.id,
        },
      });
    }

    // Create notification for the other party if not internal response
    if (!isInternal) {
      try {
        let notificationUserId = '';
        
        // If customer responded, notify staff
        if (session.user.role === 'CUSTOMER' && complaint.staffId) {
          notificationUserId = complaint.staffId;
        }
        // If staff responded, notify customer
        else if ((session.user.role === 'STAFF' || session.user.role === 'ADMIN') && complaint.userId) {
          notificationUserId = complaint.userId;
        }

        if (notificationUserId) {
          const userExists = await db.user.findUnique({
            where: { id: notificationUserId }
          });

          if (userExists) {
            await db.notification.create({
              data: {
                userId: notificationUserId,
                message: `New response received for complaint: ${complaint.title}`,
                type: 'EMAIL',
                status: 'PENDING',
              },
            });
          }
        }
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the response creation if notification fails
      }
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error creating response:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}