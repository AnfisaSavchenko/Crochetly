/**
 * Authentication Configuration Verification Script
 * Run this to verify OAuth configuration before deployment
 */

import { ConfigValidator } from '../services/configValidator';

console.log('\n🔍 AUTHENTICATION CONFIGURATION VERIFICATION\n');
console.log('='.repeat(60));

// 1. Validate environment variables
const validation = ConfigValidator.validateEnvironment();
ConfigValidator.logValidation(validation);

// 2. Check for project ID mismatch
const mismatchWarning = ConfigValidator.checkProjectIdMismatch();
if (mismatchWarning) {
  console.error('\n❌ PROJECT ID MISMATCH DETECTED:');
  console.error(mismatchWarning);
  console.error('\n');
  process.exit(1);
} else {
  console.log('✅ Project ID matches Supabase project reference\n');
}

// 3. Display OAuth flow configuration
console.log('📋 OAuth Flow Configuration:');
console.log('='.repeat(60));
console.log('1. User clicks "Sign in with Google/Apple"');
console.log('2. App opens browser to:');
console.log(`   ${process.env.EXPO_PUBLIC_AUTH_BROKER_URL}/v1/auth/[provider]/start`);
console.log('3. Browser sends parameters:');
console.log(`   - tenant: ${process.env.EXPO_PUBLIC_PROJECT_ID}`);
console.log('   - return_to: fastshot://auth/callback');
console.log('   - mode: browser');
console.log('4. Auth broker looks up Supabase OAuth config for tenant');
console.log('5. User completes OAuth with provider');
console.log('6. Browser redirects to: fastshot://auth/callback?ticket=xxx');
console.log('7. App exchanges ticket for Supabase session');
console.log('8. Session is saved and user is logged in');
console.log('='.repeat(60));

// 4. Next steps
console.log('\n📝 Next Steps:');
console.log('='.repeat(60));
console.log('1. ✅ Configuration validated');
console.log('2. ⏳ Enable OAuth providers in Supabase Dashboard:');
console.log('   - Go to https://supabase.com/dashboard/project/wijsfrgbxmpzltobxxnq');
console.log('   - Navigate to Authentication → Providers');
console.log('   - Enable Google OAuth (add Client ID/Secret)');
console.log('   - Enable Apple OAuth (add Service ID/Team ID/Key)');
console.log('   - Set redirect URLs to: https://oauth.fastshot.ai/v1/auth/callback');
console.log('3. 🧪 Test authentication in the app');
console.log('4. 🎉 Users can now sign in successfully!');
console.log('='.repeat(60) + '\n');

if (validation.isValid && !mismatchWarning) {
  console.log('✅ All configuration checks passed!\n');
  process.exit(0);
} else {
  console.error('❌ Configuration has errors. Please fix them before proceeding.\n');
  process.exit(1);
}
