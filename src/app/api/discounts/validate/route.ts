import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const quantity = parseInt(searchParams.get('quantity') || '1', 10);
  const amount = parseFloat(searchParams.get('amount') || '0');

  return validateDiscountRule(code, quantity, amount);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, quantity = 1, amount = 0 } = body;
    return validateDiscountRule(code, quantity, amount);
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: 'Invalid request body: ' + error.message },
      { status: 400 }
    );
  }
}

async function validateDiscountRule(
  code: string | null,
  quantity: number,
  amount: number
) {
  if (!code || !code.trim()) {
    return NextResponse.json(
      { valid: false, error: 'Coupon code is required' },
      { status: 400 }
    );
  }

  const cleanCode = code.trim().toUpperCase();

  try {
    const rule = await prisma.discountRule.findUnique({
      where: { code: cleanCode },
    });

    if (!rule || !rule.isActive) {
      return NextResponse.json({
        valid: false,
        error: `Coupon code '${cleanCode}' is invalid or inactive.`,
      });
    }

    const now = new Date();
    if (rule.startDate && new Date(rule.startDate) > now) {
      return NextResponse.json({
        valid: false,
        error: `Coupon code '${cleanCode}' is not active yet.`,
      });
    }

    if (rule.endDate && new Date(rule.endDate) < now) {
      return NextResponse.json({
        valid: false,
        error: `Coupon code '${cleanCode}' has expired.`,
      });
    }

    if (rule.maxUsageLimit && rule.timesUsed >= rule.maxUsageLimit) {
      return NextResponse.json({
        valid: false,
        error: `Coupon code '${cleanCode}' has reached its maximum redemption limit (${rule.maxUsageLimit}).`,
      });
    }

    if (rule.minQuantity && quantity < rule.minQuantity) {
      return NextResponse.json({
        valid: false,
        error: `Coupon '${cleanCode}' requires minimum ${rule.minQuantity} seats/units (current: ${quantity}).`,
      });
    }

    if (rule.minPurchaseAmount && amount > 0 && amount < Number(rule.minPurchaseAmount)) {
      return NextResponse.json({
        valid: false,
        error: `Coupon '${cleanCode}' requires a minimum spend of $${Number(rule.minPurchaseAmount).toFixed(2)}.`,
      });
    }

    return NextResponse.json({
      valid: true,
      rule: {
        id: rule.id,
        code: rule.code,
        name: rule.name,
        type: rule.type,
        discount_type: rule.type.toLowerCase(),
        value: Number(rule.value),
        minQuantity: rule.minQuantity,
        minPurchaseAmount: rule.minPurchaseAmount ? Number(rule.minPurchaseAmount) : null,
        scope: rule.scope,
      },
      message: `Coupon '${cleanCode}' applied: ${
        rule.type === 'PERCENTAGE' ? `${Number(rule.value)}%` : `$${Number(rule.value)}`
      } discount${rule.minQuantity ? ` on ${rule.minQuantity}+ seats` : ''}!`,
    });
  } catch (error: any) {
    console.error('Error validating discount:', error);
    return NextResponse.json(
      { valid: false, error: 'Database error validating discount: ' + error.message },
      { status: 500 }
    );
  }
}
