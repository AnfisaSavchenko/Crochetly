/**
 * Configuration Validator
 * Validates OAuth and Supabase configuration at app startup
 */

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ConfigValidator {
  /**
   * Validate all required environment variables
   */
  static validateEnvironment(): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required environment variables
    const requiredVars = {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_AUTH_BROKER_URL: process.env.EXPO_PUBLIC_AUTH_BROKER_URL,
      EXPO_PUBLIC_PROJECT_ID: process.env.EXPO_PUBLIC_PROJECT_ID,
    };

    // Check for missing variables
    for (const [key, value] of Object.entries(requiredVars)) {
      if (!value || value.trim() === '') {
        errors.push(`Missing required environment variable: ${key}`);
      }
    }

    // Validate Supabase URL format
    if (requiredVars.EXPO_PUBLIC_SUPABASE_URL) {
      if (!requiredVars.EXPO_PUBLIC_SUPABASE_URL.startsWith('https://')) {
        errors.push('EXPO_PUBLIC_SUPABASE_URL must start with https://');
      }
      if (!requiredVars.EXPO_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
        warnings.push('EXPO_PUBLIC_SUPABASE_URL does not match expected format (*.supabase.co)');
      }
    }

    // Validate Auth Broker URL
    if (requiredVars.EXPO_PUBLIC_AUTH_BROKER_URL) {
      if (requiredVars.EXPO_PUBLIC_AUTH_BROKER_URL !== 'https://oauth.fastshot.ai') {
        warnings.push(
          `EXPO_PUBLIC_AUTH_BROKER_URL is "${requiredVars.EXPO_PUBLIC_AUTH_BROKER_URL}" ` +
          'but expected "https://oauth.fastshot.ai"'
        );
      }
    }

    // Validate Supabase Anon Key format (should be a JWT)
    if (requiredVars.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      const parts = requiredVars.EXPO_PUBLIC_SUPABASE_ANON_KEY.split('.');
      if (parts.length !== 3) {
        errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY does not appear to be a valid JWT token');
      }
    }

    // Validate Project ID format (should be a UUID)
    if (requiredVars.EXPO_PUBLIC_PROJECT_ID) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(requiredVars.EXPO_PUBLIC_PROJECT_ID)) {
        warnings.push('EXPO_PUBLIC_PROJECT_ID does not appear to be a valid UUID');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Log validation results to console
   */
  static logValidation(result: ConfigValidationResult): void {
    console.log('\n=== Configuration Validation ===');

    if (result.isValid) {
      console.log('✅ Configuration is valid');
    } else {
      console.error('❌ Configuration has errors:');
      result.errors.forEach((error) => console.error(`  - ${error}`));
    }

    if (result.warnings.length > 0) {
      console.warn('⚠️  Configuration warnings:');
      result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    }

    console.log('\n=== Environment Variables ===');
    console.log('Project ID:', process.env.EXPO_PUBLIC_PROJECT_ID);
    console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('Auth Broker URL:', process.env.EXPO_PUBLIC_AUTH_BROKER_URL);
    console.log('Supabase Anon Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '[MISSING]');
    console.log('================================\n');
  }

  /**
   * Extract Supabase project reference from URL
   */
  static getSupabaseProjectRef(): string | null {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!url) return null;

    // Extract from URL like https://wijsfrgbxmpzltobxxnq.supabase.co
    const match = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
    return match ? match[1] : null;
  }

  /**
   * Check if project ID matches Supabase project ref
   * Returns error message if mismatch detected, null if OK
   */
  static checkProjectIdMismatch(): string | null {
    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    const supabaseRef = this.getSupabaseProjectRef();

    if (!projectId || !supabaseRef) {
      return null;
    }

    // Check if they match
    if (projectId !== supabaseRef) {
      return (
        `⚠️  CRITICAL: PROJECT_ID MISMATCH DETECTED:\n` +
        `  EXPO_PUBLIC_PROJECT_ID: ${projectId}\n` +
        `  Supabase Project Ref: ${supabaseRef}\n\n` +
        `❌ This WILL cause 500 errors from the auth broker!\n\n` +
        `The PROJECT_ID is sent as the "tenant" parameter to oauth.fastshot.ai.\n` +
        `The auth broker uses this to look up your Supabase OAuth configuration.\n` +
        `If the tenant doesn't match your Supabase project reference, authentication will fail.\n\n` +
        `FIX: Update .env to set:\n` +
        `  EXPO_PUBLIC_PROJECT_ID=${supabaseRef}\n`
      );
    }

    return null;
  }

  /**
   * Validate that the configuration is ready for OAuth
   * Throws an error if critical issues are found
   */
  static validateForOAuth(): void {
    const validation = this.validateEnvironment();

    if (!validation.isValid) {
      const errorMsg =
        '❌ OAUTH CONFIGURATION ERROR:\n\n' +
        validation.errors.join('\n') + '\n\n' +
        'OAuth authentication cannot proceed with these errors.';
      throw new Error(errorMsg);
    }

    const mismatch = this.checkProjectIdMismatch();
    if (mismatch) {
      throw new Error(mismatch);
    }
  }
}
