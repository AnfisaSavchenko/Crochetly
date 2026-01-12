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

    // Required environment variables for native Supabase OAuth
    const requiredVars = {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
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

    // Note: Using native Supabase OAuth - no auth broker validation needed

    // Validate Supabase Anon Key format (should be a JWT)
    if (requiredVars.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      const parts = requiredVars.EXPO_PUBLIC_SUPABASE_ANON_KEY.split('.');
      if (parts.length !== 3) {
        errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY does not appear to be a valid JWT token');
      }
    }

    // Note: PROJECT_ID not required for native Supabase OAuth

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
    console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('Supabase Anon Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '[MISSING]');
    console.log('OAuth Mode: Native Supabase (no broker)');
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
   * Note: Not required for native Supabase OAuth, but kept for reference
   */
  static checkProjectIdMismatch(): string | null {
    // Native OAuth doesn't require PROJECT_ID validation
    return null;
  }

  /**
   * Validate that the configuration is ready for native Supabase OAuth
   * Throws an error if critical issues are found
   */
  static validateForOAuth(): void {
    const validation = this.validateEnvironment();

    if (!validation.isValid) {
      const errorMsg =
        '❌ OAUTH CONFIGURATION ERROR:\n\n' +
        validation.errors.join('\n') + '\n\n' +
        'OAuth authentication cannot proceed with these errors.\n\n' +
        'Please ensure:\n' +
        '1. EXPO_PUBLIC_SUPABASE_URL is set to your Supabase project URL\n' +
        '2. EXPO_PUBLIC_SUPABASE_ANON_KEY is set to your anon/public key\n' +
        '3. OAuth providers are enabled in your Supabase Dashboard';
      throw new Error(errorMsg);
    }
  }
}
