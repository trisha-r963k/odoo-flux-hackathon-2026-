import { validatePassword, hashPassword, verifyPassword, generateResetToken, PASSWORD_REGEX } from '../../src/lib/auth/password';

async function runAuthTests() {
  console.log('🧪 Running Objective 1: Authentication & Security Unit Tests...\n');

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

  // Test 1: Password regex validation
  console.log('--- 1. Strict Password Policy Validation (Min 9 chars, Uppercase, Lowercase, Special Char) ---');

  assert(!validatePassword('Short#1').valid, 'Rejects password shorter than 9 chars');
  assert(!validatePassword('alllowercase#123').valid, 'Rejects password missing uppercase');
  assert(!validatePassword('ALLUPPERCASE#123').valid, 'Rejects password missing lowercase');
  assert(!validatePassword('NoSpecialChar12345').valid, 'Rejects password missing special character');
  assert(validatePassword('Brightloop#2026').valid, 'Accepts valid password "Brightloop#2026"');
  assert(validatePassword('StaffPass#2026').valid, 'Accepts valid password "StaffPass#2026"');
  assert(validatePassword('CustomerPass#2026').valid, 'Accepts valid password "CustomerPass#2026"');
  assert(PASSWORD_REGEX.test('Brightloop#2026'), 'Regex directly passes valid password');
  assert(!PASSWORD_REGEX.test('invalid'), 'Regex directly rejects invalid password');

  // Test 2: Argon2id Hashing and Verification
  console.log('\n--- 2. Argon2id Password Hashing & Cryptographic Verification ---');
  const password = 'Brightloop#2026';
  const hash = await hashPassword(password);

  assert(typeof hash === 'string' && hash.startsWith('$argon2id$'), 'Argon2id produces valid $argon2id$ format hash');
  assert(await verifyPassword('Brightloop#2026', hash), 'Argon2id successfully verifies authentic password');
  assert(!(await verifyPassword('WrongPassword#2026', hash)), 'Argon2id rejects incorrect password');

  // Test 3: Single-use 32-byte Hex Reset Token
  console.log('\n--- 3. Single-Use 32-Byte Hex Token & 1-Hour Expiration ---');
  const { token, expiresAt } = generateResetToken();
  assert(token.length === 64, 'Token is exactly 64 hex characters (32 random bytes)');
  const diffMinutes = (expiresAt.getTime() - Date.now()) / (1000 * 60);
  assert(diffMinutes > 58 && diffMinutes <= 60, 'Token expiration is set to 1 hour from generation');

  console.log(`\n========================================`);
  console.log(`Auth Unit Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
