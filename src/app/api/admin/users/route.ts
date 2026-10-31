import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/db/prisma';
import { validatePassword, hashPassword } from '@/lib/auth/password';
import { Role } from '@prisma/client';
import { z } from 'zod';

const createStaffSchema = z.object({
  email: z.string().email('Valid email address is required').toLowerCase().trim(),
  name: z.string().min(2, 'Name is required').trim(),
  password: z.string(),
  role: z.enum(['ADMIN', 'STAFF']),
});

// GET /api/admin/users - List users (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        customerProfile: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('List users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Provision staff/admin account (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only administrators can provision internal staff accounts' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = createStaffSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parseResult.error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const { email, name, password, role } = parseResult.data;

    // Validate password complexity
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password does not satisfy complexity requirements',
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A user with this email address already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role as Role,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `${role} account provisioned successfully`,
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Provision staff error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error provisioning account' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Toggle active state (Admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, isActive } = body;

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'userId and isActive boolean are required' },
        { status: 400 }
      );
    }

    // Prevent admin from deactivating themselves
    if (userId === session.user.id && !isActive) {
      return NextResponse.json(
        { success: false, error: 'Cannot deactivate your own active admin session' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: `User ${updated.email} is now ${isActive ? 'active' : 'deactivated'}`,
      user: updated,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}
