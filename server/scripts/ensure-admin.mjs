/**
 * Create an admin row if the email is not already registered.
 * Usage: node scripts/ensure-admin.mjs <email> <password>
 * Requires DB env vars (same as the API server).
 */
import 'dotenv/config';
import { registerAdminService } from '../src/services/adminService.js';

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/ensure-admin.mjs <email> <password>');
  process.exit(1);
}

try {
  await registerAdminService('Super Admin', email, password, 'Administration');
  console.log('Admin created:', email);
} catch (err) {
  const msg = err?.message || String(err);
  if (msg.includes('already exists')) {
    console.log('Admin already exists (skipped):', email);
    process.exit(0);
  }
  console.error(msg);
  process.exit(1);
}
