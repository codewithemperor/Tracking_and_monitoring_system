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
    if (!session || (session.user.role !== 'STAFF' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, isInternal } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check if complaint exists
    const complaint = await db.complaint.findUnique({
      where: { id: params.id },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const response = await db.complaintResponse.create({
      data: {
        complaintId: params.id,
        staffId: session.user.id,
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

    // Update complaint status if it's still OPEN
    if (complaint.status === 'OPEN') {
      await db.complaint.update({
        where: { id: params.id },
        data: {
          status: 'IN_PROGRESS',
          staffId: session.user.id,
        },
      });
    }

    // Create notification for customer if not internal response
    if (!isInternal) {
      try {
        // Verify the user exists before creating notification
        const userExists = await db.user.findUnique({
          where: { id: complaint.userId }
        });

        if (userExists) {
          await db.notification.create({
            data: {
              userId: complaint.userId,
              message: `Response received for your complaint: ${complaint.title}`,
              type: 'EMAIL',
              status: 'PENDING',
            },
          });
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