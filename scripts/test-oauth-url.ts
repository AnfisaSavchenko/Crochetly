/**
 * Test OAuth URL Construction
 * Verifies the exact URL being sent to oauth.fastshot.ai
 */

// Simulate the environment
process.env.EXPO_PUBLIC_PROJECT_ID = 'wijsfrgbxmpzltobxxnq';
process.env.EXPO_PUBLIC_AUTH_BROKER_URL = 'https://oauth.fastshot.ai';

// Import the URL builder (we'll inline it here)
function buildOAuthStartUrl(
  provider: 'google' | 'apple',
  params: {
    tenant: string;
    returnTo: string;
    mode?: 'browser' | 'webview';
    loginHint?: string;
  }
): string {
  const endpoint = provider === 'google' ? '/v1/auth/google/start' : '/v1/auth/apple/start';
  const brokerUrl = process.env.EXPO_PUBLIC_AUTH_BROKER_URL || '';
  const url = new URL(endpoint, brokerUrl);

  url.searchParams.set('tenant', params.tenant);
  url.searchParams.set('return_to', params.returnTo);
  url.searchParams.set('mode', params.mode || 'browser');

  if (params.loginHint && provider === 'google') {
    url.searchParams.set('login_hint', params.loginHint);
  }

  return url.toString();
}

// Test the URL construction
const projectId = process.env.EXPO_PUBLIC_PROJECT_ID || '';
const returnTo = 'fastshot://auth/callback';

console.log('\n🔍 OAuth URL Construction Test\n');
console.log('='.repeat(60));
console.log('Environment Variables:');
console.log(`  PROJECT_ID: "${projectId}"`);
console.log(`  AUTH_BROKER_URL: "${process.env.EXPO_PUBLIC_AUTH_BROKER_URL}"`);
console.log('='.repeat(60));

// Build Google OAuth URL
const googleUrl = buildOAuthStartUrl('google', {
  tenant: projectId,
  returnTo: returnTo,
  mode: 'browser',
});

console.log('\nGoogle OAuth URL:');
console.log(googleUrl);
console.log('\nParsed Components:');
const parsed = new URL(googleUrl);
console.log(`  Protocol: ${parsed.protocol}`);
console.log(`  Host: ${parsed.host}`);
console.log(`  Path: ${parsed.pathname}`);
console.log(`  Query Parameters:`);
parsed.searchParams.forEach((value, key) => {
  console.log(`    ${key}="${value}"`);
});

// Verify parameters
console.log('\n' + '='.repeat(60));
console.log('Verification:');
console.log('='.repeat(60));

const tenant = parsed.searchParams.get('tenant');
const return_to = parsed.searchParams.get('return_to');
const mode = parsed.searchParams.get('mode');

if (tenant === projectId) {
  console.log('✅ tenant parameter is correct');
} else {
  console.log(`❌ tenant parameter is WRONG: expected "${projectId}", got "${tenant}"`);
}

if (return_to === returnTo) {
  console.log('✅ return_to parameter is correct');
} else {
  console.log(`❌ return_to parameter is WRONG: expected "${returnTo}", got "${return_to}"`);
}

if (mode === 'browser') {
  console.log('✅ mode parameter is correct');
} else {
  console.log(`❌ mode parameter is WRONG: expected "browser", got "${mode}"`);
}

// Check for trailing slashes
if (process.env.EXPO_PUBLIC_AUTH_BROKER_URL?.endsWith('/')) {
  console.log('⚠️  WARNING: AUTH_BROKER_URL has trailing slash');
}

if (projectId.includes(' ') || projectId.includes('\n') || projectId.includes('\t')) {
  console.log('❌ PROJECT_ID contains whitespace characters!');
}

console.log('\n' + '='.repeat(60));
console.log('Final URL to test with curl:');
console.log('='.repeat(60));
console.log(googleUrl);
console.log('');
