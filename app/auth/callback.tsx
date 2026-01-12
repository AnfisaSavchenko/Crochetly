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
        console.log('Params:', params);

        // Extract the OAuth parameters from the URL
        const url = params.url as string;

        if (url) {
          // Parse the URL to extract the auth code or access token
          const urlObj = new URL(url);
          const accessToken = urlObj.searchParams.get('access_token');
          const refreshToken = urlObj.searchParams.get('refresh_token');
          const code = urlObj.searchParams.get('code');

          console.log('Access Token:', accessToken ? '✅' : '❌');
          console.log('Refresh Token:', refreshToken ? '✅' : '❌');
          console.log('Auth Code:', code ? '✅' : '❌');

          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) throw error;

            console.log('✅ Session established:', data.user?.id);
            router.replace('/');
          } else if (code) {
            // Exchange the authorization code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) throw error;

            console.log('✅ Session established:', data.user?.id);
            router.replace('/');
          } else {
            throw new Error('No valid OAuth tokens or code found in callback');
          }
        } else {
          throw new Error('No URL parameter found in callback');
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
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
