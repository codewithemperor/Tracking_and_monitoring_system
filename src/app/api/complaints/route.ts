import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  role: string;
}

interface SessionUser extends User {
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
}

interface Session {
  user: SessionUser;
}

async function getSession(request: NextRequest): Promise<Session | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader || undefined);
    
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as 'CUSTOMER' | 'STAFF' | 'ADMIN',
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    const whereClause: any = {};
    
    // Filter based on user role
    if (session.user.role === 'CUSTOMER') {
      whereClause.userId = session.user.id;
    } else if (session.user.role === 'STAFF' && userId) {
      whereClause.userId = userId;
    }

    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    if (priority) whereClause.priority = priority;

    const complaints = await db.complaint.findMany({
      where: whereClause,
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
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
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
    const { trackingId, title, description, category, priority } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify parcel exists if trackingId is provided
    if (trackingId) {
      const parcel = await db.parcel.findUnique({
        where: { trackingId },
      });

      if (!parcel) {
        return NextResponse.json({ error: 'Parcel not found' }, { status: 404 });
      }

      // Check if user owns the parcel or is staff/admin
      if (session.user.role === 'CUSTOMER' && parcel.userId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized to file complaint for this parcel' }, { status: 403 });
      }
    }

    // Verify user exists before creating complaint
    const userExists = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const complaint = await db.complaint.create({
      data: {
        trackingId,
        userId: session.user.id,
        title,
        description,
        category,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
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

    // Create notification for staff/admin
    await db.notification.create({
      data: {
        userId: session.user.role === 'ADMIN' ? session.user.id : 'system', // Would need to get actual staff/admin IDs
        message: `New complaint filed: ${title}`,
        type: 'EMAIL',
        status: 'PENDING',
      },
    });

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}