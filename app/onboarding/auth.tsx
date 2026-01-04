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
import { ConfigValidator } from '@/services/configValidator';
import { AuthDiagnosticsService } from '@/services/authDiagnostics';
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
      // Run comprehensive diagnostics
      console.log('\n🚀 INITIATING GOOGLE SIGN-IN');
      AuthDiagnosticsService.logDiagnostics('google');

      // Validate configuration before attempting OAuth
      const validationIssues = AuthDiagnosticsService.validateConfiguration();
      if (validationIssues.length > 0) {
        console.error('❌ Configuration validation failed:');
        validationIssues.forEach(issue => console.error(`  - ${issue}`));
        Alert.alert(
          'Configuration Error',
          'OAuth configuration has issues:\n\n' + validationIssues.join('\n')
        );
        return;
      }

      console.log('✅ Configuration validation passed');
      console.log('🌐 Opening OAuth browser...\n');

      await googleSignIn();
      // Note: Navigation will happen after auth callback in _layout.tsx
      // The auth callback will save profile data and mark onboarding complete
    } catch (error) {
      console.error('Google Sign In error:', error);

      // Enhanced error messaging
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      let errorTitle = 'Authentication Error';

      if (error && typeof error === 'object' && 'message' in error) {
        const errMsg = (error as Error).message.toLowerCase();

        if (errMsg.includes('500') || errMsg.includes('internal server')) {
          errorTitle = 'Configuration Error';
          errorMessage =
            'OAuth configuration issue detected. This usually means:\n\n' +
            '1. Google OAuth is not enabled in your Supabase Dashboard\n' +
            '2. Google Client ID/Secret is missing\n' +
            '3. Project configuration mismatch\n\n' +
            'Please check your Supabase Dashboard → Authentication → Providers → Google.';
        } else if (errMsg.includes('cancel') || errMsg.includes('dismiss')) {
          errorTitle = 'Sign-In Cancelled';
          errorMessage = 'You cancelled the sign-in process.';
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
      // Run comprehensive diagnostics
      console.log('\n🚀 INITIATING APPLE SIGN-IN');
      AuthDiagnosticsService.logDiagnostics('apple');

      // Validate configuration before attempting OAuth
      const validationIssues = AuthDiagnosticsService.validateConfiguration();
      if (validationIssues.length > 0) {
        console.error('❌ Configuration validation failed:');
        validationIssues.forEach(issue => console.error(`  - ${issue}`));
        Alert.alert(
          'Configuration Error',
          'OAuth configuration has issues:\n\n' + validationIssues.join('\n')
        );
        return;
      }

      console.log('✅ Configuration validation passed');
      console.log('🌐 Opening OAuth browser...\n');

      await appleSignIn();
      // Note: Navigation will happen after auth callback in _layout.tsx
      // The auth callback will save profile data and mark onboarding complete
    } catch (error) {
      console.error('Apple Sign In error:', error);

      // Enhanced error messaging
      let errorMessage = 'Failed to sign in with Apple. Please try again.';
      let errorTitle = 'Authentication Error';

      if (error && typeof error === 'object' && 'message' in error) {
        const errMsg = (error as Error).message.toLowerCase();

        if (errMsg.includes('500') || errMsg.includes('internal server')) {
          errorTitle = 'Configuration Error';
          errorMessage =
            'OAuth configuration issue detected. This usually means:\n\n' +
            '1. Apple OAuth is not enabled in your Supabase Dashboard\n' +
            '2. Apple Service ID/Team ID/Key ID is missing\n' +
            '3. Project configuration mismatch\n\n' +
            'Please check your Supabase Dashboard → Authentication → Providers → Apple.';
        } else if (errMsg.includes('cancel') || errMsg.includes('dismiss')) {
          errorTitle = 'Sign-In Cancelled';
          errorMessage = 'You cancelled the sign-in process.';
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
