/**
 * Supabase Client Configuration
 * Handles authentication and data operations with @fastshot/auth integration
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('🔍 Supabase Client Initialization');
console.log('═══════════════════════════════════════');
console.log('URL:', supabaseUrl ? `✅ ${supabaseUrl}` : '❌ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✅ Present' : '❌ Missing');
console.log('═══════════════════════════════════════');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Supabase credentials not found!');
  console.error('   Authentication will NOT work.');
  console.error('');
  console.error('🔧 To fix:');
  console.error('   1. Ensure .env file exists in project root');
  console.error('   2. Add these variables to .env:');
  console.error('      EXPO_PUBLIC_SUPABASE_URL=your-project-url');
  console.error('      EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.error('   3. Restart the development server');
  console.error('═══════════════════════════════════════');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Enable URL detection for OAuth redirects
  },
});

// Handle app state changes for token refresh
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
