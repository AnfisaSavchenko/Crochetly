/**
 * Auth Diagnostics Service
 * Provides comprehensive diagnostics for OAuth authentication
 */

export interface AuthDiagnostics {
  timestamp: string;
  projectId: string;
  projectIdLength: number;
  projectIdBytes: number[];
  supabaseUrl: string;
  supabaseRef: string | null;
  authBrokerUrl: string;
  deepLinkScheme: string;
  returnTo: string;
  oauthUrl: string;
  oauthUrlLength: number;
  encodedReturnTo: string;
  hasTrailingSlash: boolean;
  hasLeadingWhitespace: boolean;
  hasTrailingWhitespace: boolean;
}

export class AuthDiagnosticsService {
  /**
   * Extract Supabase project reference from URL
   */
  private static extractSupabaseRef(url: string): string | null {
    const match = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
    return match ? match[1] : null;
  }

  /**
   * Convert string to byte array for inspection
   */
  private static stringToBytes(str: string): number[] {
    return Array.from(str).map(char => char.charCodeAt(0));
  }

  /**
   * Generate comprehensive diagnostics
   */
  static generateDiagnostics(provider: 'google' | 'apple'): AuthDiagnostics {
    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID || '';
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    const authBrokerUrl = process.env.EXPO_PUBLIC_AUTH_BROKER_URL || '';
    const deepLinkScheme = 'fastshot';
    const returnTo = `${deepLinkScheme}://auth/callback`;
    const encodedReturnTo = encodeURIComponent(returnTo);

    const oauthUrl = `${authBrokerUrl}/v1/auth/${provider}/start?tenant=${projectId}&return_to=${encodedReturnTo}&mode=browser`;

    return {
      timestamp: new Date().toISOString(),
      projectId,
      projectIdLength: projectId.length,
      projectIdBytes: this.stringToBytes(projectId),
      supabaseUrl,
      supabaseRef: this.extractSupabaseRef(supabaseUrl),
      authBrokerUrl,
      deepLinkScheme,
      returnTo,
      oauthUrl,
      oauthUrlLength: oauthUrl.length,
      encodedReturnTo,
      hasTrailingSlash: authBrokerUrl.endsWith('/'),
      hasLeadingWhitespace: projectId !== projectId.trimStart(),
      hasTrailingWhitespace: projectId !== projectId.trimEnd(),
    };
  }

  /**
   * Log diagnostics to console in a formatted way
   */
  static logDiagnostics(provider: 'google' | 'apple'): void {
    const diagnostics = this.generateDiagnostics(provider);

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║         🔍 OAUTH AUTHENTICATION DIAGNOSTICS                    ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`📅 Timestamp: ${diagnostics.timestamp}`);
    console.log(`🔐 Provider: ${provider.toUpperCase()}\n`);

    console.log('─────────────────────────────────────────────────────────────────');
    console.log('🆔 PROJECT ID ANALYSIS');
    console.log('─────────────────────────────────────────────────────────────────');
    console.log(`Value: "${diagnostics.projectId}"`);
    console.log(`Length: ${diagnostics.projectIdLength} characters`);
    console.log(`Expected Length: 20 characters`);
    console.log(`Match: ${diagnostics.projectIdLength === 20 ? '✅ YES' : '❌ NO'}`);
    console.log(`Leading Whitespace: ${diagnostics.hasLeadingWhitespace ? '❌ YES (ISSUE!)' : '✅ NO'}`);
    console.log(`Trailing Whitespace: ${diagnostics.hasTrailingWhitespace ? '❌ YES (ISSUE!)' : '✅ NO'}`);
    console.log(`Byte Array: [${diagnostics.projectIdBytes.slice(0, 10).join(', ')}...]`);
    console.log();

    console.log('─────────────────────────────────────────────────────────────────');
    console.log('🏢 SUPABASE CONFIGURATION');
    console.log('─────────────────────────────────────────────────────────────────');
    console.log(`Supabase URL: ${diagnostics.supabaseUrl}`);
    console.log(`Extracted Ref: ${diagnostics.supabaseRef}`);
    console.log(`Project ID Match: ${diagnostics.projectId === diagnostics.supabaseRef ? '✅ YES' : '❌ NO (CRITICAL!)'}`);
    console.log();

    console.log('─────────────────────────────────────────────────────────────────');
    console.log('🔗 OAUTH BROKER CONFIGURATION');
    console.log('─────────────────────────────────────────────────────────────────');
    console.log(`Broker URL: ${diagnostics.authBrokerUrl}`);
    console.log(`Has Trailing Slash: ${diagnostics.hasTrailingSlash ? '⚠️  YES (may cause issues)' : '✅ NO'}`);
    console.log();

    console.log('─────────────────────────────────────────────────────────────────');
    console.log('↩️  DEEP LINKING');
    console.log('─────────────────────────────────────────────────────────────────');
    console.log(`Scheme: ${diagnostics.deepLinkScheme}`);
    console.log(`Return URL: ${diagnostics.returnTo}`);
    console.log(`Encoded: ${diagnostics.encodedReturnTo}`);
    console.log();

    console.log('─────────────────────────────────────────────────────────────────');
    console.log('🌐 FINAL OAUTH URL');
    console.log('─────────────────────────────────────────────────────────────────');
    console.log(`URL: ${diagnostics.oauthUrl}`);
    console.log(`Length: ${diagnostics.oauthUrlLength} characters`);
    console.log();

    console.log('─────────────────────────────────────────────────────────────────');
    console.log('🔍 BREAKDOWN OF URL COMPONENTS');
    console.log('─────────────────────────────────────────────────────────────────');
    const urlParts = new URL(diagnostics.oauthUrl);
    console.log(`Protocol: ${urlParts.protocol}`);
    console.log(`Host: ${urlParts.host}`);
    console.log(`Pathname: ${urlParts.pathname}`);
    console.log(`Search Params:`);
    urlParts.searchParams.forEach((value, key) => {
      console.log(`  - ${key}: "${value}"`);
      if (key === 'tenant') {
        console.log(`    Length: ${value.length}`);
        console.log(`    Bytes: [${this.stringToBytes(value).slice(0, 10).join(', ')}...]`);
      }
    });
    console.log();

    // Validation checks
    const issues: string[] = [];
    if (diagnostics.projectIdLength !== 20) {
      issues.push('❌ Project ID length is not 20 characters');
    }
    if (diagnostics.projectId !== diagnostics.supabaseRef) {
      issues.push('❌ Project ID does not match Supabase reference');
    }
    if (diagnostics.hasLeadingWhitespace || diagnostics.hasTrailingWhitespace) {
      issues.push('❌ Project ID has whitespace');
    }
    if (diagnostics.hasTrailingSlash) {
      issues.push('⚠️  Auth broker URL has trailing slash');
    }

    if (issues.length > 0) {
      console.log('─────────────────────────────────────────────────────────────────');
      console.log('⚠️  ISSUES DETECTED');
      console.log('─────────────────────────────────────────────────────────────────');
      issues.forEach(issue => console.log(issue));
      console.log();
    } else {
      console.log('─────────────────────────────────────────────────────────────────');
      console.log('✅ ALL VALIDATION CHECKS PASSED');
      console.log('─────────────────────────────────────────────────────────────────');
      console.log();
    }

    console.log('═══════════════════════════════════════════════════════════════════\n');
  }

  /**
   * Validate configuration and return issues
   */
  static validateConfiguration(): string[] {
    const diagnostics = this.generateDiagnostics('google');
    const issues: string[] = [];

    if (!diagnostics.projectId) {
      issues.push('Missing EXPO_PUBLIC_PROJECT_ID');
    }
    if (diagnostics.projectIdLength !== 20) {
      issues.push(`Project ID length is ${diagnostics.projectIdLength}, expected 20`);
    }
    if (diagnostics.projectId !== diagnostics.supabaseRef) {
      issues.push(`Project ID "${diagnostics.projectId}" does not match Supabase ref "${diagnostics.supabaseRef}"`);
    }
    if (diagnostics.hasLeadingWhitespace || diagnostics.hasTrailingWhitespace) {
      issues.push('Project ID contains whitespace');
    }
    if (!diagnostics.authBrokerUrl) {
      issues.push('Missing EXPO_PUBLIC_AUTH_BROKER_URL');
    }
    if (!diagnostics.supabaseUrl) {
      issues.push('Missing EXPO_PUBLIC_SUPABASE_URL');
    }

    return issues;
  }
}
