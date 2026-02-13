import bcrypt from 'bcryptjs';

// ============================================
// Password Hash Generator
// ============================================
// This script generates a bcrypt hash for your admin password.
// The hash should be stored in your Vercel environment variable: ADMIN_PASSWORD_HASH
//
// Usage:
//   1. Replace the password below with your desired password
//   2. Run: node scripts/hash-password.js
//   3. Copy the output hash to Vercel environment variables
//   4. REVERT changes to this file after use (do not commit your password)
// ============================================

// Replace with your new secure password
const password = 'eTVn0dlkZr5A&W';

// Validate password strength
if (password === 'CHANGE_THIS_TO_YOUR_NEW_PASSWORD') {
    console.error('\n❌ ERROR: You must change the default password!');
    console.error('Edit this file and replace "CHANGE_THIS_TO_YOUR_NEW_PASSWORD" with your actual password.\n');
    process.exit(1);
}

if (password.length < 8) {
    console.error('\n⚠️  WARNING: Password should be at least 8 characters long for security.\n');
}

// Generate hash with 10 rounds of salting
const hash = bcrypt.hashSync(password, 10);

console.log('\n' + '='.repeat(50));
console.log('🔐 Password Hash Generated Successfully');
console.log('='.repeat(50));
console.log('\n📋 Add this hash to your Vercel environment variables:');
console.log('   Variable Name: ADMIN_PASSWORD_HASH');
console.log('   Value:');
console.log('\n   ' + hash);
console.log('\n' + '='.repeat(50));
console.log('⚠️  IMPORTANT NEXT STEPS:');
console.log('='.repeat(50));
console.log('1. Copy the hash above');
console.log('2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('3. Add new variable: ADMIN_PASSWORD_HASH = <paste hash>');
console.log('4. Revert changes to this file (do not commit your password!)');
console.log('5. Redeploy your application');
console.log('='.repeat(50) + '\n');
