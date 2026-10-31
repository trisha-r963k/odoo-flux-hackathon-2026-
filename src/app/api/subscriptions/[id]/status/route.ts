import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { SubscriptionStatus } from '@prisma/client';

async function getNextNumber(prefix: string) {
  const year = 2026;
  const targetPrefix = `${prefix}-${year}-`;
  const existing = await prisma.subscription.findMany({
    where: {
      subscriptionNo: { startsWith: targetPrefix },
    },
    select: { subscriptionNo: true },
    orderBy: { subscriptionNo: 'desc' },
    take: 1,
  });

  let maxNum = 0;
  if (existing.length > 0) {
    const parts = existing[0].subscriptionNo.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num)) maxNum = num;
  }
  return `${targetPrefix}${String(maxNum + 1).padStart(4, '0')}`;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const normalizedStatus = status.toUpperCase() as SubscriptionStatus;
    const validStatuses = [
      SubscriptionStatus.DRAFT,
      SubscriptionStatus.QUOTATION,
      SubscriptionStatus.CONFIRMED,
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.PAUSED,
      SubscriptionStatus.CLOSED,
    ];

    if (!validStatuses.includes(normalizedStatus)) {
      return NextResponse.json(
        { error: `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const currentSub = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!currentSub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    let nextSubNumber = currentSub.subscriptionNo;

    // Transition prefix: QT-2026- -> SUB-2026- when confirmed or activated
    if (
      (normalizedStatus === SubscriptionStatus.CONFIRMED ||
        normalizedStatus === SubscriptionStatus.ACTIVE) &&
      currentSub.subscriptionNo.startsWith('QT-')
    ) {
      nextSubNumber = await getNextNumber('SUB');
    }

    const updateData: any = {
      status: normalizedStatus,
      subscriptionNo: nextSubNumber,
    };

    if (normalizedStatus === SubscriptionStatus.PAUSED) {
      updateData.pausedAt = new Date();
    } else if (normalizedStatus === SubscriptionStatus.ACTIVE) {
      updateData.pausedAt = null;
    } else if (normalizedStatus === SubscriptionStatus.CLOSED) {
      updateData.closedAt = new Date();
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      id: updated.id,
      status: updated.status.toLowerCase(),
      sub_number: updated.subscriptionNo,
      subscriptionNo: updated.subscriptionNo,
    });
  } catch (error: any) {
    console.error('Error updating subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription status: ' + error.message },
      { status: 500 }
    );
  }
}
