import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { calculateBilling, LineItemInput } from '@/lib/billing/calculator';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const s = await prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        plan: true,
        appliedDiscount: true,
        lines: {
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!s) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const lineItems: LineItemInput[] = s.lines.map((l) => ({
      productVariantId: l.productVariantId,
      basePrice: Number(l.unitPrice),
      quantity: l.quantity,
      taxRatePercent: Number(l.taxRate),
    }));

    const discountRule = s.appliedDiscount
      ? {
          id: s.appliedDiscount.id,
          code: s.appliedDiscount.code,
          type: s.appliedDiscount.type,
          value: Number(s.appliedDiscount.value),
          minQuantity: s.appliedDiscount.minQuantity || undefined,
          minPurchaseAmount: s.appliedDiscount.minPurchaseAmount
            ? Number(s.appliedDiscount.minPurchaseAmount)
            : undefined,
          scope: s.appliedDiscount.scope,
        }
      : null;

    const calc = calculateBilling(lineItems, discountRule);

    return NextResponse.json({
      subscription: {
        id: s.id,
        sub_number: s.subscriptionNo,
        subscriptionNo: s.subscriptionNo,
        customer_id: s.customerId,
        customerId: s.customerId,
        customer_name: s.customer.companyName || s.customer.contactName,
        customerName: s.customer.companyName || s.customer.contactName,
        customer_email: s.customer.user?.email || 'N/A',
        plan_id: s.planId,
        planId: s.planId,
        plan_name: s.plan.name,
        planName: s.plan.name,
        status: s.status.toLowerCase(),
        status_upper: s.status,
        start_date: s.startDate.toISOString().split('T')[0],
        next_billing_date: s.nextBillingDate.toISOString().split('T')[0],
        payment_terms: s.paymentTerms,
        subtotal: Number(calc.subtotal),
        discount_amount: Number(calc.discountTotal),
        taxable_amount: Number(calc.taxableSubtotal),
        tax_amount: Number(calc.taxTotal),
        total_recurring_amount: Number(calc.grandTotal),
        grandTotal: Number(calc.grandTotal),
        lines: s.lines.map((l) => ({
          id: l.id,
          product_id: l.productVariant.productId,
          variant_id: l.productVariantId,
          product_name: l.productVariant.product.name,
          variant_name: `${l.productVariant.attributeName}: ${l.productVariant.attributeValue}`,
          quantity: l.quantity,
          unit_price: Number(l.unitPrice),
          tax_rate: Number(l.taxRate),
          amount: Number(l.amount),
        })),
        discount: s.appliedDiscount
          ? {
              id: s.appliedDiscount.id,
              code: s.appliedDiscount.code,
              value: Number(s.appliedDiscount.value),
              type: s.appliedDiscount.type,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/subscriptions/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.subscription.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Subscription deleted' });
  } catch (error: any) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription: ' + error.message },
      { status: 500 }
    );
  }
}
