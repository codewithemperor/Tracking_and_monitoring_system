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
        role: UserRole.CUSTOMER
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
      const { email, password, name, phone, address } = body;

      if (!email || !password || !name) {
        return NextResponse.json(
          { error: 'Missing required fields' },
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
          role: UserRole.CUSTOMER,
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

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    console.error('Admin customers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);