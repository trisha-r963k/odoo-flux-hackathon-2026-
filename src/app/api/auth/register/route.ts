import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validatePassword, hashPassword } from '@/lib/auth/password';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Valid email address is required').toLowerCase().trim(),
  password: z.string(),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters').trim(),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').trim(),
  phone: z.string().optional(),
  billingStreet: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZip: z.string().optional(),
  billingCountry: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = registerSchema.safeParse(body);

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

    const {
      email,
      password,
      contactName,
      companyName,
      phone,
      billingStreet,
      billingCity,
      billingState,
      billingZip,
      billingCountry,
    } = parseResult.data;

    // Strict Password Policy Validation (Hackathon Spec)
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

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email address already exists',
        },
        { status: 409 }
      );
    }

    // Hash with Argon2id
    const passwordHash = await hashPassword(password);

    // Atomic transaction: Create User + CustomerProfile
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name: contactName,
          passwordHash,
          role: 'CUSTOMER',
          isActive: true,
          customerProfile: {
            create: {
              companyName,
              contactName,
              phone: phone || null,
              billingStreet: billingStreet || null,
              billingCity: billingCity || null,
              billingState: billingState || null,
              billingZip: billingZip || null,
              billingCountry: billingCountry || null,
            },
          },
        },
        include: {
          customerProfile: true,
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          customerProfileId: user.customerProfile?.id,
          companyName: user.customerProfile?.companyName,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error occurred during registration',
      },
      { status: 500 }
    );
  }
}
