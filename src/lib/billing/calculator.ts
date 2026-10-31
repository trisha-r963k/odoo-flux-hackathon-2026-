import { Decimal } from 'decimal.js';

// Configure Decimal.js for strict 2-decimal financial rounding (Banker's / Half Up)
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface LineItemInput {
  productVariantId: string;
  basePrice: Decimal | number | string;
  priceAdjustment?: Decimal | number | string; // e.g. +560.00 for Odoo Brand Edition
  quantity: number;
  taxRatePercent?: Decimal | number | string; // e.g. 18.00 for 18% VAT
  description?: string;
}

export interface DiscountRuleInput {
  id?: string;
  code?: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE';
  value: Decimal | number | string; // e.g. 50.00 or 20 for 20%
  scope: 'GLOBAL' | 'SPECIFIC_PRODUCTS';
  eligibleProducts?: string[]; // ProductVariant IDs if SPECIFIC_PRODUCTS
  minQuantity?: number | null;
  minPurchaseAmount?: Decimal | number | string | null;
}

export interface CalculatedLine {
  productVariantId: string;
  description: string;
  quantity: number;
  basePrice: Decimal;
  priceAdjustment: Decimal;
  effectiveUnitPrice: Decimal; // basePrice + priceAdjustment
  lineSubtotal: Decimal; // effectiveUnitPrice * quantity
  discountAmount: Decimal;
  taxableAmount: Decimal; // lineSubtotal - discountAmount
  taxRatePercent: Decimal;
  taxAmount: Decimal;
  lineTotal: Decimal; // taxableAmount + taxAmount
}

export interface CalculationSummary {
  lines: CalculatedLine[];
  totalQuantity: number;
  subtotal: Decimal; // Sum of lineSubtotal
  discountTotal: Decimal; // Total discounts applied
  taxableSubtotal: Decimal; // subtotal - discountTotal
  taxTotal: Decimal; // Sum of taxAmount
  grandTotal: Decimal; // taxableSubtotal + taxTotal
  discountApplied: boolean;
  discountMessage?: string;
}

/**
 * Pure mathematical billing engine using Decimal.js.
 * Handles effective unit prices (variants), tiered quantities, promotional discounts, and exact taxes.
 */
export function calculateBilling(
  items: LineItemInput[],
  discountRule?: DiscountRuleInput | null
): CalculationSummary {
  if (!items || items.length === 0) {
    return {
      lines: [],
      totalQuantity: 0,
      subtotal: new Decimal(0),
      discountTotal: new Decimal(0),
      taxableSubtotal: new Decimal(0),
      taxTotal: new Decimal(0),
      grandTotal: new Decimal(0),
      discountApplied: false,
    };
  }

  let totalQty = 0;
  let rawSubtotal = new Decimal(0);

  // Step 1: Pre-calculate effective prices and subtotal
  const preLines = items.map((item) => {
    const qty = Math.max(1, item.quantity);
    totalQty += qty;

    const basePrice = new Decimal(item.basePrice || 0);
    const adjustment = new Decimal(item.priceAdjustment || 0);
    const effectiveUnitPrice = basePrice.plus(adjustment);
    const lineSubtotal = effectiveUnitPrice.times(qty);

    rawSubtotal = rawSubtotal.plus(lineSubtotal);

    const taxRate = new Decimal(item.taxRatePercent || 0);

    return {
      productVariantId: item.productVariantId,
      description: item.description || '',
      quantity: qty,
      basePrice,
      priceAdjustment: adjustment,
      effectiveUnitPrice,
      lineSubtotal,
      taxRatePercent: taxRate,
    };
  });

  // Step 2: Evaluate Discount Eligibility
  let isDiscountEligible = false;
  let discountMessage = '';

  if (discountRule) {
    const meetsQty = !discountRule.minQuantity || totalQty >= discountRule.minQuantity;
    const meetsMinAmount =
      !discountRule.minPurchaseAmount ||
      rawSubtotal.greaterThanOrEqualTo(new Decimal(discountRule.minPurchaseAmount));

    if (meetsQty && meetsMinAmount) {
      isDiscountEligible = true;
      discountMessage = `Applied discount code: ${discountRule.code || discountRule.type}`;
    } else {
      discountMessage = !meetsQty
        ? `Discount requires minimum ${discountRule.minQuantity} items (current: ${totalQty})`
        : `Discount requires minimum spend of $${discountRule.minPurchaseAmount}`;
    }
  }

  // Step 3: Compute Line Discounts and Taxes
  let globalDiscountRemaining = new Decimal(0);
  if (isDiscountEligible && discountRule) {
    if (discountRule.type === 'FIXED_AMOUNT') {
      globalDiscountRemaining = Decimal.min(new Decimal(discountRule.value), rawSubtotal);
    }
  }

  let accumulatedDiscount = new Decimal(0);
  let accumulatedTax = new Decimal(0);

  const calculatedLines: CalculatedLine[] = preLines.map((line, idx) => {
    let lineDiscount = new Decimal(0);

    if (isDiscountEligible && discountRule) {
      const isEligibleLine =
        discountRule.scope === 'GLOBAL' ||
        (discountRule.scope === 'SPECIFIC_PRODUCTS' &&
          discountRule.eligibleProducts?.includes(line.productVariantId));

      if (isEligibleLine) {
        if (discountRule.type === 'PERCENTAGE') {
          const pct = new Decimal(discountRule.value).dividedBy(100);
          lineDiscount = line.lineSubtotal.times(pct).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        } else if (discountRule.type === 'FIXED_AMOUNT') {
          // Prorate fixed discount across items or distribute proportionally
          if (idx === preLines.length - 1) {
            lineDiscount = globalDiscountRemaining;
          } else {
            const lineShare = line.lineSubtotal.dividedBy(rawSubtotal);
            const allocated = new Decimal(discountRule.value)
              .times(lineShare)
              .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
            lineDiscount = Decimal.min(allocated, globalDiscountRemaining);
            globalDiscountRemaining = globalDiscountRemaining.minus(lineDiscount);
          }
        }
      }
    }

    // Taxable amount cannot be negative
    const taxableAmount = Decimal.max(0, line.lineSubtotal.minus(lineDiscount));

    // Calculate line tax
    const lineTax = taxableAmount
      .times(line.taxRatePercent)
      .dividedBy(100)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const lineTotal = taxableAmount.plus(lineTax);

    accumulatedDiscount = accumulatedDiscount.plus(lineDiscount);
    accumulatedTax = accumulatedTax.plus(lineTax);

    return {
      ...line,
      discountAmount: lineDiscount,
      taxableAmount,
      taxAmount: lineTax,
      lineTotal,
    };
  });

  const subtotalRounded = rawSubtotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const discountRounded = accumulatedDiscount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const taxableSubtotal = subtotalRounded.minus(discountRounded);
  const taxRounded = accumulatedTax.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const grandTotal = taxableSubtotal.plus(taxRounded);

  return {
    lines: calculatedLines,
    totalQuantity: totalQty,
    subtotal: subtotalRounded,
    discountTotal: discountRounded,
    taxableSubtotal,
    taxTotal: taxRounded,
    grandTotal,
    discountApplied: isDiscountEligible,
    discountMessage: isDiscountEligible ? discountMessage : undefined,
  };
}
