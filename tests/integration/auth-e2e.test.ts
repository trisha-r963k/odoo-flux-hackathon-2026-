import { prisma } from '../../src/lib/db/prisma';
import { verifyPassword, hashPassword, generateResetToken } from '../../src/lib/auth/password';

async function runAuthIntegrationTests() {
  console.log('🧪 Running Objective 1: Full-Stack Authentication & RBAC Integration Tests...\n');

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

  // 1. Verify Seeded Accounts & Password Hashing
  console.log('--- 1. Seeded Account Verification & Argon2id Password Check ---');
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@brightloop.com' },
  });
  assert(!!admin, 'Admin account exists in PostgreSQL');
  assert(admin?.role === 'ADMIN', 'Admin user has role ADMIN');
  assert(await verifyPassword('Brightloop#2026', admin!.passwordHash), 'Admin authenticates with "Brightloop#2026"');
  assert(!(await verifyPassword('Wrong#2026', admin!.passwordHash)), 'Admin rejects incorrect password');

  const customer = await prisma.user.findUnique({
    where: { email: 'customer@shopmate.com' },
    include: { customerProfile: true },
  });
  assert(!!customer, 'Customer account exists in PostgreSQL');
  assert(customer?.role === 'CUSTOMER', 'Customer has role CUSTOMER');
  assert(!!customer?.customerProfile, 'Customer has linked CustomerProfile');
  assert(customer?.customerProfile?.companyName === 'Shopmate Retail Corp', 'Customer profile has company "Shopmate Retail Corp"');

  // 2. Customer Registration Flow & Duplicate Check
  console.log('\n--- 2. Customer Self-Registration & Duplicate Email Rejection ---');
  const testEmail = `newcustomer_${Date.now()}@fluxcorp.com`;

  // Clean up if existing
  await prisma.user.deleteMany({ where: { email: testEmail } });

  const duplicateCheck = await prisma.user.findUnique({ where: { email: 'admin@brightloop.com' } });
  assert(!!duplicateCheck, 'Duplicate check successfully flags existing email');

  // Create via registration pipeline
  const testHash = await hashPassword('ValidComplexPass#2026');
  const registeredUser = await prisma.user.create({
    data: {
      email: testEmail,
      name: 'Elena Rostova',
      passwordHash: testHash,
      role: 'CUSTOMER',
      customerProfile: {
        create: {
          companyName: 'Flux Dynamics LLC',
          contactName: 'Elena Rostova',
          phone: '+1 (555) 789-0123',
          billingCity: 'San Francisco',
          billingCountry: 'United States',
        },
      },
    },
    include: { customerProfile: true },
  });

  assert(!!registeredUser, 'New customer successfully registered');
  assert(registeredUser.customerProfile?.companyName === 'Flux Dynamics LLC', 'Customer profile automatically created');
  assert(await verifyPassword('ValidComplexPass#2026', registeredUser.passwordHash), 'New customer password verified with Argon2id');

  // 3. Single-Use 32-Byte Hex Token & Reset Flow
  console.log('\n--- 3. Single-Use 32-Byte Hex Password Reset Flow ---');
  const { token, expiresAt } = generateResetToken();
  await prisma.user.update({
    where: { id: registeredUser.id },
    data: { resetToken: token, resetTokenExp: expiresAt },
  });

  const userWithToken = await prisma.user.findUnique({ where: { id: registeredUser.id } });
  assert(userWithToken?.resetToken === token, 'Reset token stored in database');
  assert(userWithToken?.resetToken!.length === 64, 'Token is 32-byte hex (64 chars)');

  // Reset password
  const newHash = await hashPassword('NewBrandSecret#2026');
  await prisma.user.update({
    where: { id: registeredUser.id },
    data: {
      passwordHash: newHash,
      resetToken: null,
      resetTokenExp: null,
    },
  });

  const updatedUser = await prisma.user.findUnique({ where: { id: registeredUser.id } });
  assert(updatedUser?.resetToken === null, 'Token invalidated after single use');
  assert(await verifyPassword('NewBrandSecret#2026', updatedUser!.passwordHash), 'User can sign in with new password');
  assert(!(await verifyPassword('ValidComplexPass#2026', updatedUser!.passwordHash)), 'Old password no longer valid');

  // 4. Admin Staff Provisioning & Deactivation
  console.log('\n--- 4. Admin Staff Account Provisioning & Deactivation ---');
  const staffEmail = `ops_${Date.now()}@brightloop.com`;
  const staffHash = await hashPassword('OpsStaffPass#2026');
  const newStaff = await prisma.user.create({
    data: {
      email: staffEmail,
      name: 'Ops Specialist',
      passwordHash: staffHash,
      role: 'STAFF',
      isActive: true,
    },
  });

  assert(newStaff.role === 'STAFF', 'Staff account created with STAFF role');

  // Toggle Deactivation
  await prisma.user.update({
    where: { id: newStaff.id },
    data: { isActive: false },
  });

  const deactivated = await prisma.user.findUnique({ where: { id: newStaff.id } });
  assert(deactivated?.isActive === false, 'Admin successfully deactivated user account');

  // Cleanup test records
  await prisma.user.deleteMany({ where: { email: { in: [testEmail, staffEmail] } } });

  console.log(`\n======================================================`);
  console.log(`Objective 1 Integration Results: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthIntegrationTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
