import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { calculateBilling, LineItemInput } from '@/lib/billing/calculator';
import { BillingFrequency, SubscriptionStatus } from '@prisma/client';

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status')?.toUpperCase();
    const customerId = searchParams.get('customerId');
    const search = searchParams.get('search')?.toLowerCase();

    const where: any = {};
    if (statusParam && statusParam !== 'ALL') {
      where.status = statusParam as SubscriptionStatus;
    }
    if (customerId) {
      where.customerId = customerId;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    const formatted = subscriptions
      .filter((s) => {
        if (!search) return true;
        const subNo = s.subscriptionNo.toLowerCase();
        const custName = (s.customer.companyName || s.customer.contactName || '').toLowerCase();
        const planName = s.plan.name.toLowerCase();
        return subNo.includes(search) || custName.includes(search) || planName.includes(search);
      })
      .map((s) => {
        // Calculate totals from lines and discount
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

        return {
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
        };
      });

    return NextResponse.json({ subscriptions: formatted });
  } catch (error: any) {
    console.error('Error in GET /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerId,
      customer_id,
      planId,
      plan_id,
      status = 'QUOTATION',
      paymentTerms = 'Immediate Payment',
      payment_terms,
      discountId,
      discount_id,
      lines = [],
    } = body;

    const actualCustomerId = customerId || customer_id;
    const actualPlanId = planId || plan_id;
    const actualPaymentTerms = paymentTerms || payment_terms || 'Immediate Payment';
    const actualDiscountId = discountId || discount_id || null;

    if (!actualCustomerId) {
      return NextResponse.json({ error: 'Customer is required' }, { status: 400 });
    }
    if (!actualPlanId) {
      return NextResponse.json({ error: 'Billing plan is required' }, { status: 400 });
    }
    if (!lines || lines.length === 0) {
      return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 });
    }

    // Verify Plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: actualPlanId },
    });
    if (!plan) {
      return NextResponse.json({ error: 'Selected plan not found' }, { status: 404 });
    }

    // Load discount if specified
    let discountRuleRecord = null;
    let discountRuleInput = null;
    if (actualDiscountId) {
      discountRuleRecord = await prisma.discountRule.findUnique({
        where: { id: actualDiscountId },
      });
      if (discountRuleRecord) {
        discountRuleInput = {
          id: discountRuleRecord.id,
          code: discountRuleRecord.code,
          type: discountRuleRecord.type,
          value: Number(discountRuleRecord.value),
          minQuantity: discountRuleRecord.minQuantity || undefined,
          minPurchaseAmount: discountRuleRecord.minPurchaseAmount
            ? Number(discountRuleRecord.minPurchaseAmount)
            : undefined,
          scope: discountRuleRecord.scope,
        };
      }
    }

    // Normalize line items
    const lineInputs: LineItemInput[] = [];
    for (const line of lines) {
      const pId = line.productId || line.product_id;
      let vId = line.variantId || line.variant_id;
      const qty = parseInt(line.quantity || '1', 10);
      let unitPrice = line.unitPrice !== undefined ? Number(line.unitPrice) : null;

      // If variantId not provided, fetch default variant for product
      if (!vId && pId) {
        const product = await prisma.product.findUnique({
          where: { id: pId },
          include: { variants: true },
        });
        if (product && product.variants.length > 0) {
          vId = product.variants[0].id;
          if (unitPrice === null) {
            unitPrice = Number(product.salesPrice) + Number(product.variants[0].priceAdjustment);
          }
        } else if (product && unitPrice === null) {
          unitPrice = Number(product.salesPrice);
        }
      }

      if (!vId) {
        return NextResponse.json(
          { error: `Product variant could not be resolved for product ${pId}` },
          { status: 400 }
        );
      }

      if (unitPrice === null) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: vId },
          include: { product: true },
        });
        if (variant) {
          unitPrice = Number(variant.product.salesPrice) + Number(variant.priceAdjustment);
        } else {
          unitPrice = 0;
        }
      }

      lineInputs.push({
        productVariantId: vId,
        basePrice: unitPrice,
        quantity: qty,
        taxRatePercent: 18.0,
      });
    }

    // Pure math calculation engine
    const calculation = calculateBilling(lineInputs, discountRuleInput);

    // Status normalization
    const normalizedStatus = (status.toUpperCase() as SubscriptionStatus) || SubscriptionStatus.QUOTATION;
    const isQuotation =
      normalizedStatus === SubscriptionStatus.DRAFT ||
      normalizedStatus === SubscriptionStatus.QUOTATION;

    // Generate sequential number
    const prefix = isQuotation ? 'QT' : 'SUB';
    const subscriptionNo = await getNextNumber(prefix);

    const now = new Date();
    const nextBilling = new Date(now);
    if (plan.billingFrequency === BillingFrequency.DAILY) {
      nextBilling.setDate(nextBilling.getDate() + 1);
    } else if (plan.billingFrequency === BillingFrequency.WEEKLY) {
      nextBilling.setDate(nextBilling.getDate() + 7);
    } else if (plan.billingFrequency === BillingFrequency.MONTHLY) {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    } else if (plan.billingFrequency === BillingFrequency.YEARLY) {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    }

    // Atomic transaction
    const createdSubscription = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: {
          subscriptionNo,
          customerId: actualCustomerId,
          planId: actualPlanId,
          status: normalizedStatus,
          startDate: now,
          nextBillingDate: nextBilling,
          paymentTerms: actualPaymentTerms,
          billingFrequency: plan.billingFrequency,
          appliedDiscountId: discountRuleRecord ? discountRuleRecord.id : null,
          autoRenew: plan.allowAutoRenew,
        },
      });

      for (let i = 0; i < lineInputs.length; i++) {
        const item = lineInputs[i];
        const calcLine = calculation.lines[i];
        await tx.subscriptionLine.create({
          data: {
            subscriptionId: sub.id,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            unitPrice: Number(item.basePrice),
            taxRate: Number(item.taxRatePercent || 18),
            amount: Number(calcLine.taxableAmount), // line subtotal after discount
          },
        });
      }

      if (discountRuleRecord && normalizedStatus === SubscriptionStatus.ACTIVE) {
        await tx.discountRule.update({
          where: { id: discountRuleRecord.id },
          data: { timesUsed: { increment: 1 } },
        });
      }

      return sub;
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: createdSubscription.id,
        sub_number: createdSubscription.subscriptionNo,
        subscriptionNo: createdSubscription.subscriptionNo,
        status: createdSubscription.status.toLowerCase(),
        totals: calculation,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to create quotation/subscription: ' + error.message },
      { status: 500 }
    );
  }
}
