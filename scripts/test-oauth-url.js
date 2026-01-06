/**
 * OAuth URL Test Script
 * Simulates the OAuth URL generation to identify issues
 */

// Read .env file
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║         🧪 OAUTH URL GENERATION TEST                          ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Read environment variables
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    env[key.trim()] = valueParts.join('=').trim();
  }
});

console.log('📄 Environment Variables Loaded:\n');
console.log('  EXPO_PUBLIC_PROJECT_ID:', env.EXPO_PUBLIC_PROJECT_ID || '❌ MISSING');
console.log('  EXPO_PUBLIC_SUPABASE_URL:', env.EXPO_PUBLIC_SUPABASE_URL || '❌ MISSING');
console.log('  EXPO_PUBLIC_AUTH_BROKER_URL:', env.EXPO_PUBLIC_AUTH_BROKER_URL || '❌ MISSING');
console.log();

// Generate OAuth URLs
const projectId = env.EXPO_PUBLIC_PROJECT_ID || '';
const brokerUrl = env.EXPO_PUBLIC_AUTH_BROKER_URL || '';
const deepLinkScheme = 'fastshot';
const returnTo = `${deepLinkScheme}://auth/callback`;
const encodedReturnTo = encodeURIComponent(returnTo);

console.log('─────────────────────────────────────────────────────────────────');
console.log('🔍 PROJECT ID ANALYSIS');
console.log('─────────────────────────────────────────────────────────────────');
console.log(`Raw Value: "${projectId}"`);
console.log(`Length: ${projectId.length} characters`);
console.log(`Expected: 20 characters`);
console.log(`Match: ${projectId.length === 20 ? '✅ YES' : '❌ NO'}`);

// Check for hidden characters
const bytes = Buffer.from(projectId, 'utf8');
console.log(`Byte Length: ${bytes.length}`);
console.log(`First 10 bytes: [${Array.from(bytes.slice(0, 10)).join(', ')}]`);
console.log(`Last 10 bytes: [${Array.from(bytes.slice(-10)).join(', ')}]`);

// Check for BOM or other issues
if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
  console.log('⚠️  WARNING: UTF-8 BOM detected at start of PROJECT_ID!');
}

console.log();

console.log('─────────────────────────────────────────────────────────────────');
console.log('🌐 OAUTH URL GENERATION');
console.log('─────────────────────────────────────────────────────────────────');

const googleUrl = `${brokerUrl}/v1/auth/google/start?tenant=${projectId}&return_to=${encodedReturnTo}&mode=browser`;
const appleUrl = `${brokerUrl}/v1/auth/apple/start?tenant=${projectId}&return_to=${encodedReturnTo}&mode=browser`;

console.log('Google OAuth URL:');
console.log(googleUrl);
console.log();
console.log('Apple OAuth URL:');
console.log(appleUrl);
console.log();

console.log('─────────────────────────────────────────────────────────────────');
console.log('🔎 URL COMPONENT INSPECTION');
console.log('─────────────────────────────────────────────────────────────────');

const url = new URL(googleUrl);
console.log(`Protocol: ${url.protocol}`);
console.log(`Host: ${url.host}`);
console.log(`Pathname: ${url.pathname}`);
console.log('Query Parameters:');
url.searchParams.forEach((value, key) => {
  console.log(`  ${key}: "${value}"`);
  if (key === 'tenant') {
    console.log(`    → Length: ${value.length}`);
    console.log(`    → Bytes: [${Buffer.from(value).slice(0, 10).join(', ')}...]`);
  }
});
console.log();

console.log('─────────────────────────────────────────────────────────────────');
console.log('✅ VALIDATION CHECKS');
console.log('─────────────────────────────────────────────────────────────────');

const checks = [
  {
    name: 'Project ID length is 20',
    pass: projectId.length === 20,
  },
  {
    name: 'Project ID has no whitespace',
    pass: projectId === projectId.trim() && !projectId.includes(' '),
  },
  {
    name: 'Broker URL is HTTPS',
    pass: brokerUrl.startsWith('https://'),
  },
  {
    name: 'Broker URL has no trailing slash',
    pass: !brokerUrl.endsWith('/'),
  },
  {
    name: 'Return URL uses fastshot scheme',
    pass: returnTo.startsWith('fastshot://'),
  },
];

checks.forEach(check => {
  console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
});

const allPassed = checks.every(c => c.pass);
console.log();
console.log(allPassed ? '🎉 All checks passed!' : '⚠️  Some checks failed - review above');
console.log();

console.log('═══════════════════════════════════════════════════════════════════\n');
