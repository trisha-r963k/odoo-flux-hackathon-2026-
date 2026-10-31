import { calculateBilling } from '../../src/lib/billing/calculator';
import Decimal from 'decimal.js';

async function runQuotationBuilderTests() {
  console.log('🧪 Running Quotation Builder & Workflow Unit Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Variant Effective Price Calculation
  console.log('--- 1. Effective Pricing & Variant Attribute Adjustments ---');
  const erpWithOdoo = calculateBilling([
    {
      productVariantId: 'var_odoo_brand',
      description: 'Cloud ERP + Odoo Brand Edition',
      basePrice: 1200.0,
      priceAdjustment: 560.0,
      quantity: 1,
      taxRatePercent: 0,
    },
  ]);
  assert(erpWithOdoo.subtotal.equals(new Decimal(1760.0)), 'Unit price $1,200 + $560 equals $1,760.00');

  // 2. Promotional Discount Evaluation & Minimum Quantity Thresholds
  console.log('\n--- 2. Promotional Discount Thresholds (ODU20: min 5 seats) ---');
  // Less than 5 seats -> No discount
  const underThreshold = calculateBilling(
    [
      {
        productVariantId: 'var_odoo_brand',
        basePrice: 1200.0,
        priceAdjustment: 560.0,
        quantity: 4,
        taxRatePercent: 18.0,
      },
    ],
    {
      code: 'ODU20',
      type: 'PERCENTAGE',
      value: 20,
      minQuantity: 5,
      scope: 'GLOBAL',
    }
  );
  assert(underThreshold.discountApplied === false, 'Coupon ODU20 is not applied for 4 seats (< 5 threshold)');
  assert(underThreshold.discountTotal.equals(new Decimal(0)), 'Discount total is $0.00 when ineligible');

  // 5+ seats -> 20% discount applied
  const atThreshold = calculateBilling(
    [
      {
        productVariantId: 'var_odoo_brand',
        basePrice: 1200.0,
        priceAdjustment: 560.0,
        quantity: 5,
        taxRatePercent: 18.0,
      },
    ],
    {
      code: 'ODU20',
      type: 'PERCENTAGE',
      value: 20,
      minQuantity: 5,
      scope: 'GLOBAL',
    }
  );
  assert(atThreshold.discountApplied === true, 'Coupon ODU20 is applied for 5 seats');
  // 5 * 1760 = 8800. 20% of 8800 = 1760.
  assert(atThreshold.discountTotal.equals(new Decimal(1760.0)), 'Discount equals $1,760.00 (20% of $8,800)');

  // 3. Hackathon Scene 4 Verification (10 seats of Cloud ERP + Odoo Brand Edition)
  console.log('\n--- 3. Hackathon Scene 4 Master Demo Precision Verification ---');
  const scene4 = calculateBilling(
    [
      {
        productVariantId: 'var_odoo_brand',
        description: 'Brightloop Cloud ERP (Odoo Brand Edition)',
        basePrice: 1200.0,
        priceAdjustment: 560.0,
        quantity: 10,
        taxRatePercent: 18.0,
      },
    ],
    {
      id: 'disc_odu20',
      code: 'ODU20',
      type: 'PERCENTAGE',
      value: 20.0,
      minQuantity: 5,
      scope: 'GLOBAL',
    }
  );

  assert(scene4.subtotal.equals(new Decimal(17600.0)), 'Scene 4 Subtotal equals $17,600.00 (10 x $1,760)');
  assert(scene4.discountTotal.equals(new Decimal(3520.0)), 'Scene 4 Discount equals -$3,520.00 (20% of $17,600)');
  assert(scene4.taxableSubtotal.equals(new Decimal(14080.0)), 'Scene 4 Taxable Base equals $14,080.00 ($17,600 - $3,520)');
  assert(scene4.taxTotal.equals(new Decimal(2534.4)), 'Scene 4 Standard VAT (18%) equals +$2,534.40');
  assert(scene4.grandTotal.equals(new Decimal(16614.4)), 'Scene 4 Grand Total equals exactly $16,614.40');

  // 4. Multi-Line Item Arithmetic (Software + SLA Support Add-on)
  console.log('\n--- 4. Multi-Product & Add-on Calculations ---');
  const multiLine = calculateBilling([
    {
      productVariantId: 'var_odoo_brand',
      description: 'Cloud ERP + Odoo Brand',
      basePrice: 1200.0,
      priceAdjustment: 560.0,
      quantity: 2,
      taxRatePercent: 18.0,
    },
    {
      productVariantId: 'var_sla_support',
      description: '24/7 Dedicated Support',
      basePrice: 300.0,
      priceAdjustment: 0.0,
      quantity: 1,
      taxRatePercent: 18.0,
    },
  ]);
  // Line 1: 2 * 1760 = 3520
  // Line 2: 1 * 300 = 300
  // Subtotal = 3820. VAT = 3820 * 0.18 = 687.60. Total = 4507.60
  assert(multiLine.subtotal.equals(new Decimal(3820.0)), 'Multi-line subtotal equals $3,820.00');
  assert(multiLine.taxTotal.equals(new Decimal(687.6)), 'Multi-line VAT (18%) equals $687.60');
  assert(multiLine.grandTotal.equals(new Decimal(4507.6)), 'Multi-line Grand Total equals $4,507.60');

  // 5. Sequential Numbering Scheme
  console.log('\n--- 5. Sequential Numbering Regex & Conventions ---');
  const quoteNumberRegex = /^QT-2026-\d{4}$/;
  const subNumberRegex = /^SUB-2026-\d{4}$/;

  assert(quoteNumberRegex.test('QT-2026-0001'), 'QT-2026-0001 matches quotation format');
  assert(quoteNumberRegex.test('QT-2026-0042'), 'QT-2026-0042 matches quotation format');
  assert(subNumberRegex.test('SUB-2026-0001'), 'SUB-2026-0001 matches subscription format');
  assert(!quoteNumberRegex.test('SUB-2026-0001'), 'SUB-2026-0001 rejected by quotation regex');

  // Summary
  console.log(`\n========================================`);
  console.log(`  Tests Completed: ${passed + failed}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runQuotationBuilderTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
