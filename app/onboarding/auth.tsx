/**
 * Onboarding Screen 6: Authorization Gate
 * Final screen with Apple/Google sign-in options using native Supabase OAuth
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/services/supabaseClient';
import { StrokedText } from '@/components';
import { AuthButton } from './components';
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme';

// Warm up the browser for faster OAuth
WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = React.useState<'google' | 'apple' | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // User is already authenticated, navigate to home
        router.replace('/');
      }
    };
    checkAuth();
  }, [router]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session) {
        // Auth successful, navigate to home
        setIsLoading(null);
        router.replace('/');
      } else if (event === 'SIGNED_OUT') {
        setIsLoading(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading('google');
      console.log('🚀 INITIATING GOOGLE SIGN-IN');

      // Get the redirect URI for OAuth
      const redirectTo = makeRedirectUri({
        scheme: 'com.crochetly.app',
        path: 'auth/callback',
      });

      console.log('📍 Redirect URI:', redirectTo);

      // Sign in with Google using Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;

      if (!data?.url) {
        throw new Error('No authorization URL returned');
      }

      console.log('🌐 Opening OAuth browser...');

      // Open the OAuth URL in a browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      console.log('📱 Browser result:', result.type);

      if (result.type === 'cancel') {
        setIsLoading(null);
        Alert.alert('Sign-In Cancelled', 'You cancelled the sign-in process.');
      } else if (result.type === 'success') {
        // The auth state change listener will handle navigation
        console.log('✅ OAuth success, waiting for session...');
      }
    } catch (error) {
      console.error('Google Sign In error:', error);
      setIsLoading(null);

      // Enhanced error messaging
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      let errorTitle = 'Authentication Error';

      if (error && typeof error === 'object' && 'message' in error) {
        const errMsg = (error as Error).message.toLowerCase();

        if (errMsg.includes('not enabled') || errMsg.includes('provider')) {
          errorTitle = 'Configuration Error';
          errorMessage =
            'Google OAuth is not enabled for this app.\n\n' +
            'Please enable Google OAuth in your Supabase Dashboard:\n' +
            'Authentication → Providers → Google';
        } else if (errMsg.includes('network')) {
          errorTitle = 'Network Error';
          errorMessage = 'Please check your internet connection and try again.';
        }
      }

      Alert.alert(errorTitle, errorMessage);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading('apple');
      console.log('🚀 INITIATING APPLE SIGN-IN');

      // Get the redirect URI for OAuth
      const redirectTo = makeRedirectUri({
        scheme: 'com.crochetly.app',
        path: 'auth/callback',
      });

      console.log('📍 Redirect URI:', redirectTo);

      // Sign in with Apple using Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;

      if (!data?.url) {
        throw new Error('No authorization URL returned');
      }

      console.log('🌐 Opening OAuth browser...');

      // Open the OAuth URL in a browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      console.log('📱 Browser result:', result.type);

      if (result.type === 'cancel') {
        setIsLoading(null);
        Alert.alert('Sign-In Cancelled', 'You cancelled the sign-in process.');
      } else if (result.type === 'success') {
        // The auth state change listener will handle navigation
        console.log('✅ OAuth success, waiting for session...');
      }
    } catch (error) {
      console.error('Apple Sign In error:', error);
      setIsLoading(null);

      // Enhanced error messaging
      let errorMessage = 'Failed to sign in with Apple. Please try again.';
      let errorTitle = 'Authentication Error';

      if (error && typeof error === 'object' && 'message' in error) {
        const errMsg = (error as Error).message.toLowerCase();

        if (errMsg.includes('not enabled') || errMsg.includes('provider')) {
          errorTitle = 'Configuration Error';
          errorMessage =
            'Apple OAuth is not enabled for this app.\n\n' +
            'Please enable Apple OAuth in your Supabase Dashboard:\n' +
            'Authentication → Providers → Apple';
        } else if (errMsg.includes('network')) {
          errorTitle = 'Network Error';
          errorMessage = 'Please check your internet connection and try again.';
        }
      }

      Alert.alert(errorTitle, errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.xxl,
            paddingBottom: insets.bottom + Spacing.xxl + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Celebratory Title */}
        <View style={styles.titleContainer}>
          <StrokedText fontSize={42} lineHeight={50}>
            Your Crochet Plan{'\n'}Is Ready ✨
          </StrokedText>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Create an account to save your patterns and progress.
        </Text>

        {/* Flexible spacer to push buttons down but keep them visible */}
        <View style={{ flex: 1, minHeight: Spacing.xxl }} />

        {/* Auth Buttons - Always visible and prominent */}
        <View style={styles.authContainer}>
          {Platform.OS === 'ios' && (
            <AuthButton
              provider="apple"
              onPress={handleAppleSignIn}
              loading={isLoading === 'apple'}
              disabled={isLoading === 'google'}
              style={styles.authButton}
            />
          )}
          <AuthButton
            provider="google"
            onPress={handleGoogleSignIn}
            loading={isLoading === 'google'}
            disabled={isLoading === 'apple'}
            style={styles.authButton}
          />
        </View>

        {/* Footer Text */}
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  titleContainer: {
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.sm,
  },
  authContainer: {
    marginBottom: Spacing.md,
  },
  authButton: {
    marginBottom: Spacing.md,
  },
  footerText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.light,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.xl,
  },
});
