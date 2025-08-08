import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';

async function handler(req: AuthenticatedRequest) {
  try {
    if (req.method === 'GET') {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search');
      const page = searchParams.get('page') || '1';
      const limit = searchParams.get('limit') || '10';
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {
        role: {
          in: [UserRole.STAFF, UserRole.ADMIN]
        }
      };

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        db.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            phone: true,
            address: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                parcels: true,
                assignedParcels: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: Number(limit),
        }),
        db.user.count({ where }),
      ]);

      return NextResponse.json({
        users,
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
      const { email, password, name, phone, address, role } = body;

      if (!email || !password || !name || !role) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      if (!Object.values(UserRole).includes(role as UserRole)) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }

      // Hash password
      const { hashPassword } = await import('@/lib/auth');
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await db.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone,
          address,
          role: role as UserRole,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          address: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ user });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      const { userId, email, name, phone, address, role } = body;

      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }

      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Update user
      const user = await db.user.update({
        where: { id: userId },
        data: {
          ...(email && { email }),
          ...(name && { name }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(role && { role: role as UserRole }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          address: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ user });
    }

    if (req.method === 'DELETE') {
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get('userId');

      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required' },
          { status: 400 }
        );
      }

      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Delete user
      await db.user.delete({
        where: { id: userId },
      });

      return NextResponse.json({ message: 'User deleted successfully' });
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    console.error('Admin staff API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);
export const PUT = withAuth(handler);
export const DELETE = withAuth(handler);