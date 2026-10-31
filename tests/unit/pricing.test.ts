import { calculateBilling } from '../../src/lib/billing/calculator';
import Decimal from 'decimal.js';

async function runPricingTests() {
  console.log('🧪 Running Pure Math Pricing Engine Unit Tests (Decimal.js)...\n');

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

  // Test 1: Base variant price adjustment ($1,200 + $560 = $1,760)
  console.log('--- 1. Effective Price Calculation with Odoo Brand (+560) Variant ---');
  const singleItem = calculateBilling([
    {
      productVariantId: 'var-odoo-560',
      basePrice: 1200.00,
      priceAdjustment: 560.00,
      quantity: 1,
      taxRatePercent: 0,
    },
  ]);

  assert(singleItem.subtotal.equals(new Decimal(1760.00)), 'Subtotal equals 1760.00 ($1200 + $560)');
  assert(singleItem.grandTotal.equals(new Decimal(1760.00)), 'Grand total equals 1760.00 with 0% tax');

  // Test 2: Master Demo Walkthrough Scene 4 calculation:
  // 10 seats of Cloud ERP ($1,760 each)
  // Subtotal = $17,600.00
  // Discount ODU20 (20% off for 5+ seats) = -$3,520.00
  // Taxable subtotal = $14,080.00
  // Standard VAT 18% = +$2,534.40
  // Grand Total = $16,614.40
  console.log('\n--- 2. Master Demo Scene 4 Calculation (10 seats, 20% discount, 18% VAT) ---');
  const demoQuote = calculateBilling(
    [
      {
        productVariantId: 'var-odoo-560',
        description: 'Brightloop Cloud ERP (Odoo Brand Edition)',
        basePrice: 1200.00,
        priceAdjustment: 560.00,
        quantity: 10,
        taxRatePercent: 18.00,
      },
    ],
    {
      code: 'ODU20',
      type: 'PERCENTAGE',
      value: 20.00,
      scope: 'GLOBAL',
      minQuantity: 5,
    }
  );

  assert(demoQuote.subtotal.equals(new Decimal(17600.00)), 'Subtotal is exactly $17,600.00 (10 x $1,760.00)');
  assert(demoQuote.discountApplied === true, 'Discount ODU20 is marked as applied');
  assert(demoQuote.discountTotal.equals(new Decimal(3520.00)), 'Discount total is exactly -$3,520.00 (20% of $17,600)');
  assert(demoQuote.taxableSubtotal.equals(new Decimal(14080.00)), 'Taxable subtotal is exactly $14,080.00');
  assert(demoQuote.taxTotal.equals(new Decimal(2534.40)), 'VAT (18%) is exactly $2,534.40');
  assert(demoQuote.grandTotal.equals(new Decimal(16614.40)), 'Grand Total is exactly $16,614.40');

  // Test 3: Minimum quantity discount rejection
  console.log('\n--- 3. Minimum Quantity Threshold Enforcement ---');
  const underThreshold = calculateBilling(
    [
      {
        productVariantId: 'var-odoo-560',
        basePrice: 1200.00,
        priceAdjustment: 560.00,
        quantity: 3, // Less than minimum 5 seats
        taxRatePercent: 18.00,
      },
    ],
    {
      code: 'ODU20',
      type: 'PERCENTAGE',
      value: 20.00,
      scope: 'GLOBAL',
      minQuantity: 5,
    }
  );

  assert(underThreshold.discountApplied === false, 'Discount rejected when quantity < minQuantity');
  assert(underThreshold.discountTotal.equals(new Decimal(0)), 'Discount total is $0.00');

  console.log(`\n========================================`);
  console.log(`Pricing Unit Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runPricingTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
