/**
 * Supabase Client Configuration
 * Handles authentication and data operations
 *
 * NOTE: Requires @supabase/supabase-js to be installed
 * Run: npm install @supabase/supabase-js expo-web-browser expo-linking
 * See SUPABASE_SETUP.md for full configuration
 */

// Type-safe supabase client
type SupabaseClient = any;

let supabase: SupabaseClient;

try {
  // Dynamically import supabase to allow compilation without the package
  const { createClient } = require('@supabase/supabase-js');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Authentication will not work.');
    console.warn('See SUPABASE_SETUP.md for configuration instructions.');
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} catch (error) {
  console.error('Supabase is not installed. Install with: npm install @supabase/supabase-js');
  console.error('See SUPABASE_SETUP.md for full setup instructions');

  // Create mock supabase client
  supabase = {
    auth: {
      signInWithOAuth: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      getUser: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      upsert: async () => ({ error: { message: 'Supabase not configured' } }),
    }),
  };
}

export { supabase };
