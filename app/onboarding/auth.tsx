/**
 * Onboarding Screen 6: Authorization Gate
 * Final screen with Apple/Google sign-in options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StrokedText } from '@/components';
import { AuthButton } from './components';
import { OnboardingStorage } from '@/services/onboardingStorage';
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme';

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const handleAuthComplete = async () => {
    try {
      // Mark onboarding as completed
      await OnboardingStorage.setOnboardingCompleted();
      // Navigate to main app
      router.replace('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoadingApple(true);
    try {
      // TODO: Implement Apple Sign In
      // For now, simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await handleAuthComplete();
    } catch (error) {
      console.error('Apple Sign In error:', error);
      Alert.alert('Error', 'Apple Sign In is not available yet. Please try Google.');
    } finally {
      setIsLoadingApple(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    try {
      // TODO: Implement Google Sign In
      // For now, simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await handleAuthComplete();
    } catch (error) {
      console.error('Google Sign In error:', error);
      Alert.alert('Error', 'Google Sign In is not available yet.');
    } finally {
      setIsLoadingGoogle(false);
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
          <AuthButton
            provider="apple"
            onPress={handleAppleSignIn}
            loading={isLoadingApple}
            disabled={isLoadingGoogle}
            style={styles.authButton}
          />
          <AuthButton
            provider="google"
            onPress={handleGoogleSignIn}
            loading={isLoadingGoogle}
            disabled={isLoadingApple}
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
