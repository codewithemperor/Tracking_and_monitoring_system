import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['CUSTOMER', 'STAFF', 'ADMIN']),
});

const updateUserSchema = z.object({
  userId: z.string(),
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['CUSTOMER', 'STAFF', 'ADMIN']).optional(),
});

async function handler(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (req.user!.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    if (req.method === 'GET') {
      const { search, role, page = 1, limit = 10 } = new URL(req.url).searchParams;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (role && Object.values(UserRole).includes(role as UserRole)) {
        where.role = role as UserRole;
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
      const { email, password, name, phone, address, role } = createUserSchema.parse(body);

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

      return NextResponse.json({
        message: 'User created successfully',
        user,
      });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      const { userId, email, name, phone, address, role } = updateUserSchema.parse(body);

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

      // Check if email is already taken by another user
      if (email && email !== existingUser.email) {
        const emailTaken = await db.user.findUnique({
          where: { email },
        });

        if (emailTaken) {
          return NextResponse.json(
            { error: 'Email is already taken by another user' },
            { status: 400 }
          );
        }
      }

      // Update user
      const updateData: any = {};
      if (email !== undefined) updateData.email = email;
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (role !== undefined) updateData.role = role as UserRole;

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          address: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({
        message: 'User updated successfully',
        user: updatedUser,
      });
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
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Don't allow deleting admin users
      if (user.role === UserRole.ADMIN) {
        return NextResponse.json(
          { error: 'Cannot delete admin users' },
          { status: 400 }
        );
      }

      // Delete user
      await db.user.delete({
        where: { id: userId },
      });

      return NextResponse.json({
        message: 'User deleted successfully',
      });
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Admin users API error:', error);
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