/**
 * OAuth Callback Handler
 * Handles the redirect from OAuth providers (Google, Apple)
 * and exchanges the authorization code for a session
 */

import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/services/supabaseClient';
import { Colors, FontSize, Fonts } from '@/constants/theme';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('📥 OAuth callback received');
        console.log('═══════════════════════════════════════');
        console.log('🔍 All params:', JSON.stringify(params, null, 2));

        // Get all potential token/code locations
        const accessToken = params.access_token as string;
        const refreshToken = params.refresh_token as string;
        const code = params.code as string;
        const errorParam = params.error as string;
        const errorDescription = params.error_description as string;

        console.log('📦 Token Status:');
        console.log('  Access Token:', accessToken ? '✅ Present' : '❌ Missing');
        console.log('  Refresh Token:', refreshToken ? '✅ Present' : '❌ Missing');
        console.log('  Auth Code:', code ? '✅ Present' : '❌ Missing');

        if (errorParam) {
          console.error('❌ OAuth Error:', errorParam);
          console.error('   Description:', errorDescription);
          throw new Error(`OAuth error: ${errorParam} - ${errorDescription}`);
        }

        if (accessToken && refreshToken) {
          // Direct token exchange (implicit flow)
          console.log('🔐 Using direct token exchange...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('❌ Failed to set session:', error);
            throw error;
          }

          console.log('✅ Session established successfully');
          console.log('   User ID:', data.user?.id);
          console.log('   Email:', data.user?.email);
          console.log('═══════════════════════════════════════');
          router.replace('/');
        } else if (code) {
          // PKCE flow - exchange authorization code for session
          console.log('🔐 Using PKCE flow (code exchange)...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('❌ Failed to exchange code for session:', error);
            throw error;
          }

          console.log('✅ Session established successfully');
          console.log('   User ID:', data.user?.id);
          console.log('   Email:', data.user?.email);
          console.log('═══════════════════════════════════════');
          router.replace('/');
        } else {
          console.error('❌ No valid OAuth tokens or code found');
          console.error('   Expected: access_token + refresh_token OR code');
          console.error('   Received params:', Object.keys(params).join(', '));
          throw new Error('No valid OAuth credentials in callback URL');
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        console.error('═══════════════════════════════════════');
        // Navigate back to auth screen on error
        router.replace('/onboarding/auth');
      }
    };

    handleCallback();
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Completing sign-in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  text: {
    marginTop: 16,
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
    color: Colors.text,
  },
});
