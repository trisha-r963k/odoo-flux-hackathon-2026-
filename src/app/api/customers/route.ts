import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const customers = await prisma.customerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { companyName: 'asc' },
    });

    const formatted = customers.map((c) => ({
      id: c.id,
      userId: c.userId,
      company_name: c.companyName,
      companyName: c.companyName,
      contact_name: c.contactName || c.user.name,
      contactName: c.contactName || c.user.name,
      email: c.user.email,
      name: c.companyName,
    }));

    return NextResponse.json({ customers: formatted });
  } catch (error: any) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, company_name, contact_name, phone, address } = body;

    const companyName = company_name || name;
    const contact = contact_name || name || 'Primary Contact';
    const customerEmail = email || `contact@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company or customer name is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      // Create user with default customer role
      user = await prisma.user.create({
        data: {
          email: customerEmail,
          name: contact,
          role: 'CUSTOMER',
          // Dummy hash for quick creation
          passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhashforquickcustomercreation',
        },
      });
    }

    // Check or create CustomerProfile
    let profile = await prisma.customerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.customerProfile.create({
        data: {
          userId: user.id,
          companyName: companyName,
          contactName: contact,
          phone: phone || null,
          billingStreet: address || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: profile.id,
        userId: user.id,
        company_name: profile.companyName,
        companyName: profile.companyName,
        contact_name: profile.contactName,
        contactName: profile.contactName,
        email: customerEmail,
        name: profile.companyName,
      },
    });
  } catch (error: any) {
    console.error('Failed to create customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer: ' + error.message },
      { status: 500 }
    );
  }
}
