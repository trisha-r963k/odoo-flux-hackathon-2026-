import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import crypto from 'node:crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        customerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'This account has been deactivated. Contact an administrator.' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Role-specific permission scopes
    const permissions =
      user.role === 'ADMIN'
        ? ['all']
        : user.role === 'STAFF'
        ? ['quotes', 'invoices', 'subscriptions', 'payments']
        : ['portal'];

    // Session token
    const token = 'bl_token_' + crypto.randomBytes(24).toString('hex');

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.customerProfile?.contactName || user.email.split('@')[0],
        role: user.role.toLowerCase(), // 'admin' | 'staff' | 'customer'
        permissions,
        tenantId: user.customerProfile?.id || null,
        companyName: user.customerProfile?.companyName || null,
      },
    });
  } catch (error: any) {
    console.error('API login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
