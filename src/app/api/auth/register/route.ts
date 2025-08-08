import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { hashPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

// Helper function to generate auto-generated IDs
function generateUserId(role: UserRole): string {
  const timestamp = Date.now().toString().slice(-6); // Get last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3-digit random number
  
  switch (role) {
    case 'CUSTOMER':
      return `NIPCUS${timestamp}${random}`;
    case 'STAFF':
      return `NIPSTFF${timestamp}${random}`;
    case 'ADMIN':
      return `NIPADM${timestamp}${random}`;
    default:
      return `NIPCUS${timestamp}${random}`;
  }
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN']).optional().default('CUSTOMER'),
  adminCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone, address, role, adminCode } = registerSchema.parse(body);

    // Validate admin registration
    if (role === 'ADMIN') {
      if (adminCode !== 'ADMIN2024') {
        return NextResponse.json(
          { error: 'Invalid admin registration code' },
          { status: 400 }
        );
      }
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
    const passwordHash = await hashPassword(password);

    // Generate custom user ID
    const customUserId = generateUserId(role as UserRole);

    // Create user with custom ID
    const user = await db.user.create({
      data: {
        id: customUserId,
        email,
        passwordHash,
        name,
        phone,
        address,
        role: role as UserRole,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}