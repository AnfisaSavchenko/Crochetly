/**
 * Onboarding Screen 6: Authorization Gate
 * Final screen with Apple/Google sign-in options using @fastshot/auth
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
import { useGoogleSignIn, useAppleSignIn } from '@fastshot/auth';
import { supabase } from '@/services/supabaseClient';
import { StrokedText } from '@/components';
import { AuthButton } from './components';
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme';

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // @fastshot/auth hooks for OAuth
  const { signIn: googleSignIn, isLoading: googleLoading } = useGoogleSignIn({
    supabaseClient: supabase,
  });

  const { signIn: appleSignIn, isLoading: appleLoading } = useAppleSignIn({
    supabaseClient: supabase,
  });

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

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      // Note: Navigation will happen after auth callback in _layout.tsx
      // The auth callback will save profile data and mark onboarding complete
    } catch (error) {
      console.error('Google Sign In error:', error);
      Alert.alert(
        'Authentication Error',
        'Failed to sign in with Google. Please try again.'
      );
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await appleSignIn();
      // Note: Navigation will happen after auth callback in _layout.tsx
      // The auth callback will save profile data and mark onboarding complete
    } catch (error) {
      console.error('Apple Sign In error:', error);
      Alert.alert(
        'Authentication Error',
        'Failed to sign in with Apple. Please try again.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.xxl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebratory Title */}
        <View style={styles.titleContainer}>
          <StrokedText fontSize={42} lineHeight={50}>
            Your Crochet Plan{'\n'}Is Ready ✨
          </StrokedText>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Create an account to save patterns, track progress, and continue your personalized journey.
        </Text>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Auth Buttons */}
        <View style={styles.authContainer}>
          {Platform.OS === 'ios' && (
            <AuthButton
              provider="apple"
              onPress={handleAppleSignIn}
              loading={appleLoading}
              disabled={googleLoading}
              style={styles.authButton}
            />
          )}
          <AuthButton
            provider="google"
            onPress={handleGoogleSignIn}
            loading={googleLoading}
            disabled={appleLoading}
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
    paddingHorizontal: Spacing.lg,
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  spacer: {
    height: Spacing.xxl,
  },
  authContainer: {
    marginBottom: Spacing.xl,
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
