import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { cost: 'asc' },
    });

    const formatted = plans.map((p) => ({
      id: p.id,
      name: p.name,
      cost: Number(p.cost),
      price: Number(p.cost),
      billing_frequency: p.billingFrequency.toLowerCase(),
      billingFrequency: p.billingFrequency,
      minimumQuantity: p.minimumQuantity,
      availableFrom: p.availableFrom,
      availableTo: p.availableTo,
      autoCloseAtEnd: p.autoCloseAtEnd,
      allowEarlyClose: p.allowEarlyClose,
      allowPause: p.allowPause,
      allowAutoRenew: p.allowAutoRenew,
    }));

    return NextResponse.json({ plans: formatted });
  } catch (error: any) {
    console.error('Failed to fetch billing plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing plans: ' + error.message },
      { status: 500 }
    );
  }
}
