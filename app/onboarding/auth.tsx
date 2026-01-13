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

  // Initialize Google Sign-In hook
  const { signIn: googleSignIn, isLoading: isGoogleLoading } = useGoogleSignIn({
    supabaseClient: supabase,
  });

  // Initialize Apple Sign-In hook (iOS only)
  const { signIn: appleSignIn, isLoading: isAppleLoading } = useAppleSignIn({
    supabaseClient: supabase,
  });

  // Check if user is already authenticated and onboarding is complete
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if onboarding is already completed in the database
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (profile?.onboarding_completed) {
          console.log('✅ User already authenticated and onboarded, redirecting to main screen');
          router.replace('/');
        } else {
          console.log('⚠️ User authenticated but onboarding not complete yet');
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleGoogleSignIn = async () => {
    console.log('🚀 Initiating Google Sign-In via Auth Broker');
    await googleSignIn();
    // Note: The callback will be handled by useAuthCallback in _layout.tsx
  };

  const handleAppleSignIn = async () => {
    console.log('🍎 Initiating Apple Sign-In via Auth Broker');
    await appleSignIn();
    // Note: The callback will be handled by useAuthCallback in _layout.tsx
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
              loading={isAppleLoading}
              disabled={isGoogleLoading}
              style={styles.authButton}
            />
          )}
          <AuthButton
            provider="google"
            onPress={handleGoogleSignIn}
            loading={isGoogleLoading}
            disabled={isAppleLoading}
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
