import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Brightloop database seeding...');

  // 1. Clean slate for core models in development
  await prisma.payment.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscriptionLine.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.quotationLine.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.quotationTemplateItem.deleteMany();
  await prisma.quotationTemplate.deleteMany();
  await prisma.discountRule.deleteMany();
  await prisma.taxRule.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Default Tax Rules (Obj 5 spec)
  const standardVat = await prisma.taxRule.create({
    data: {
      name: 'Standard VAT (18%)',
      ratePercent: 18.00,
      countryCode: 'US',
      isDefault: true,
      isActive: true,
    },
  });

  const stateTax = await prisma.taxRule.create({
    data: {
      name: 'State Sales Tax (8%)',
      ratePercent: 8.00,
      countryCode: 'US',
      isDefault: false,
      isActive: true,
    },
  });

  console.log('✅ Seeded Tax Rules:', standardVat.name, stateTax.name);

  // 3. Seed Users with Argon2id Hashes (Obj 1 spec)
  const adminPasswordHash = await hashPassword('Brightloop#2026');
  const staffPasswordHash = await hashPassword('StaffPass#2026');
  const customerPasswordHash = await hashPassword('CustomerPass#2026');

  // Master Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@brightloop.com',
      name: 'Alex Rivera (Admin)',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Sales & Operations Staff
  const staff = await prisma.user.create({
    data: {
      email: 'staff@brightloop.com',
      name: 'Sarah Chen (Sales Ops)',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
      isActive: true,
    },
  });

  const sales = await prisma.user.create({
    data: {
      email: 'sales@brightloop.com',
      name: 'Alex Rivera (Sales Ops)',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
      isActive: true,
    },
  });

  // Customer Account with CustomerProfile (Shopmate Retail Corp)
  const customer = await prisma.user.create({
    data: {
      email: 'customer@shopmate.com',
      name: 'Marcus Vance',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      isActive: true,
      customerProfile: {
        create: {
          companyName: 'Shopmate Retail Corp',
          contactName: 'Marcus Vance',
          phone: '+1 (555) 234-5678',
          billingStreet: '742 Evergreen Terrace',
          billingCity: 'Springfield',
          billingState: 'OR',
          billingZip: '97477',
          billingCountry: 'United States',
          taxIdentifier: 'US-987654321',
        },
      },
    },
    include: {
      customerProfile: true,
    },
  });

  // Customer Account for Acme Corp (Hackathon Scene 4)
  const acmeCustomer = await prisma.user.create({
    data: {
      email: 'billing@acmecorp.com',
      name: 'Wile E. Coyote',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      isActive: true,
      customerProfile: {
        create: {
          companyName: 'Acme Corp',
          contactName: 'Wile E. Coyote',
          phone: '+1 (555) 987-6543',
          billingStreet: '100 Desert Bluffs Way',
          billingCity: 'Flagstaff',
          billingState: 'AZ',
          billingZip: '86001',
          billingCountry: 'United States',
          taxIdentifier: 'US-112233445',
        },
      },
    },
    include: {
      customerProfile: true,
    },
  });

  console.log('✅ Seeded Users:');
  console.log(`   Admin:    ${admin.email} [ADMIN]`);
  console.log(`   Staff:    ${staff.email}, ${sales.email} [STAFF]`);
  console.log(`   Customer: ${customer.email} [CUSTOMER] -> Profile: ${customer.customerProfile?.companyName}`);
  console.log(`   Customer: ${acmeCustomer.email} [CUSTOMER] -> Profile: ${acmeCustomer.customerProfile?.companyName}`);

  // 4. Seed Products & Variants (Obj 2 spec)
  const cloudErp = await prisma.product.create({
    data: {
      name: 'Brightloop Cloud ERP',
      productType: 'Software',
      salesPrice: 1200.00,
      costPrice: 400.00,
      notes: 'Core enterprise resource planning module',
      variants: {
        create: [
          {
            attributeName: 'Brand',
            attributeValue: 'Odoo Brand Edition',
            priceAdjustment: 560.00, // +$560.00 as highlighted in hackathon spec!
            sku: 'BL-ERP-ODOO-560',
          },
          {
            attributeName: 'Tier',
            attributeValue: 'Standard Cloud',
            priceAdjustment: 0.00,
            sku: 'BL-ERP-STD',
          },
          {
            attributeName: 'Tier',
            attributeValue: 'Enterprise Dedicated',
            priceAdjustment: 850.00,
            sku: 'BL-ERP-ENT-850',
          },
        ],
      },
    },
    include: { variants: true },
  });

  const apiAddon = await prisma.product.create({
    data: {
      name: 'High-Volume API Gateway',
      productType: 'Add-on',
      salesPrice: 150.00,
      costPrice: 30.00,
      notes: 'Up to 1,000,000 webhook events per month',
      variants: {
        create: [
          {
            attributeName: 'Volume',
            attributeValue: '1M Monthly Calls',
            priceAdjustment: 0.00,
            sku: 'BL-API-1M',
          },
          {
            attributeName: 'Volume',
            attributeValue: '5M Monthly Calls',
            priceAdjustment: 300.00,
            sku: 'BL-API-5M',
          },
        ],
      },
    },
    include: { variants: true },
  });

  console.log('✅ Seeded Products & Variants:');
  console.log(`   Product: ${cloudErp.name} ($${cloudErp.salesPrice}) with ${cloudErp.variants.length} variants`);
  console.log(`   Product: ${apiAddon.name} ($${apiAddon.salesPrice}) with ${apiAddon.variants.length} variants`);

  // 5. Seed Billing Plans (Obj 3 spec)
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  const monthlyPro = await prisma.plan.create({
    data: {
      name: 'Monthly Pro (Odoo Brand)',
      cost: 1760.00,
      billingFrequency: 'MONTHLY',
      minimumQuantity: 1,
      availableFrom: now,
      availableTo: nextYear,
      autoCloseAtEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowAutoRenew: true,
      isActive: true,
    },
  });

  const annualEnterprise = await prisma.plan.create({
    data: {
      name: 'Annual Enterprise Suite',
      cost: 18000.00,
      billingFrequency: 'YEARLY',
      minimumQuantity: 5,
      availableFrom: now,
      availableTo: nextYear,
      autoCloseAtEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowAutoRenew: true,
      isActive: true,
    },
  });

  console.log('✅ Seeded Plans:');
  console.log(`   Plan: ${monthlyPro.name} ($${monthlyPro.cost}/mo)`);
  console.log(`   Plan: ${annualEnterprise.name} ($${annualEnterprise.cost}/yr)`);

  // 6. Seed Promotional Discount (Obj 6 spec)
  const odooDiscount = await prisma.discountRule.create({
    data: {
      code: 'ODU20',
      name: 'Odoo x FLUX 20% Promotional Discount',
      type: 'PERCENTAGE',
      value: 20.00,
      minQuantity: 5,
      minPurchaseAmount: 1000.00,
      startDate: now,
      endDate: nextYear,
      maxUsageLimit: 100,
      timesUsed: 0,
      scope: 'GLOBAL',
      isActive: true,
    },
  });

  console.log('✅ Seeded Discount Rule:', odooDiscount.code, '(-20% for 5+ seats)');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
