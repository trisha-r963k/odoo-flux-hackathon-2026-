import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validatePassword, hashPassword } from '@/lib/auth/password';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is required'),
  newPassword: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = resetPasswordSchema.safeParse(body);

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

    const { token, newPassword } = parseResult.data;

    // Check token existence and expiration
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
      },
    });

    if (!user || !user.resetTokenExp) {
      return NextResponse.json(
        { success: false, error: 'Invalid or already used password reset token' },
        { status: 400 }
      );
    }

    if (new Date() > user.resetTokenExp) {
      return NextResponse.json(
        { success: false, error: 'Password reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Validate new password complexity
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password does not meet complexity requirements',
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Hash with Argon2id
    const passwordHash = await hashPassword(newPassword);

    // Atomically update password and invalidate single-use token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password successfully reset. You may now sign in with your new credentials.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error resetting password' },
      { status: 500 }
    );
  }
}
