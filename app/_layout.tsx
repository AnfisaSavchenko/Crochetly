/**
 * Root Layout
 * Main navigation structure for Crochetly with custom font loading and auth callback handling
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthCallback } from '@fastshot/auth';
import { supabase } from '@/services/supabaseClient';
import { AuthService } from '@/services/authService';
import { ConfigValidator } from '@/services/configValidator';
import { Colors } from '@/constants/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Validate configuration on app startup
const configValidation = ConfigValidator.validateEnvironment();
ConfigValidator.logValidation(configValidation);

// Check for project ID mismatch (common cause of 500 errors)
const mismatchWarning = ConfigValidator.checkProjectIdMismatch();
if (mismatchWarning) {
  console.warn('\n' + mismatchWarning + '\n');
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'SFUIText-Heavy': require('../assets/fonts/SFUIText-Heavy.ttf'),
    'SFUIText-Light': require('../assets/fonts/SFUIText-Light.ttf'),
  });

  // Handle OAuth callback from @fastshot/auth
  // This hook listens for deep links (fastshot://auth/callback?ticket=xxx)
  // and automatically exchanges the ticket for a Supabase session
  const { isProcessing } = useAuthCallback({
    supabaseClient: supabase,
    onSuccess: async ({ user, session }) => {
      console.log('=== Auth Callback Success ===');
      console.log('User ID:', user.id);
      console.log('User Email:', user.email);
      console.log('Session expires at:', new Date(session.expires_at! * 1000).toISOString());

      try {
        // Save user profile with quiz data and mark onboarding complete
        // This writes to the user_profiles table in Supabase
        await AuthService.saveUserProfileAfterAuth(user.id);
        console.log('✅ User profile saved successfully');
        // Navigation to home will happen automatically via the redirect check in index.tsx
      } catch (error) {
        console.error('❌ Error saving user profile after auth:', error);

        // If profile save fails, it's likely an RLS policy issue or table doesn't exist
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        Alert.alert(
          'Profile Save Error',
          `Authentication succeeded but failed to save your profile.\n\n` +
          `Error: ${errorMsg}\n\n` +
          `This may indicate:\n` +
          `• RLS policies are blocking the write\n` +
          `• user_profiles table doesn't exist\n` +
          `• Network connectivity issue\n\n` +
          `Please check Supabase logs or contact support.`
        );
      }
    },
    onError: (error) => {
      console.error('=== Auth Callback Error ===');
      console.error('Error type:', error.type);
      console.error('Error message:', error.message);
      console.error('Original error:', error.originalError);

      // Enhanced error messaging with specific troubleshooting steps
      let errorMessage = error.message || 'Failed to complete sign in';
      let errorTitle = 'Authentication Error';

      if (error.message?.toLowerCase().includes('500') ||
          error.message?.toLowerCase().includes('internal server')) {
        errorTitle = 'OAuth Broker Error (500)';
        errorMessage =
          'The authentication broker returned a 500 error. Common causes:\n\n' +
          '1. OAuth providers not enabled in Supabase Dashboard\n' +
          '   → Go to Authentication → Providers → Enable Google/Apple\n\n' +
          '2. Missing OAuth credentials (Client ID/Secret)\n' +
          '   → Add credentials in Supabase provider settings\n\n' +
          '3. PROJECT_ID mismatch in .env file\n' +
          '   → EXPO_PUBLIC_PROJECT_ID must match Supabase project ref\n\n' +
          '4. Redirect URI not configured correctly\n' +
          '   → Add https://oauth.fastshot.ai/v1/auth/callback to provider settings';
      } else if (error.message?.toLowerCase().includes('ticket')) {
        errorTitle = 'Session Exchange Error';
        errorMessage =
          'Failed to exchange authentication ticket for a session.\n\n' +
          'This usually means:\n' +
          '• The ticket expired (tickets are valid for 60 seconds)\n' +
          '• Network connectivity issue\n' +
          '• Auth broker is temporarily unavailable\n\n' +
          'Please try signing in again.';
      }

      Alert.alert(errorTitle, errorMessage);
    },
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show loading state while fonts load or auth is processing
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Show loading during OAuth callback processing
  if (isProcessing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="project/new"
          options={{
            headerShown: true,
            title: 'New Project',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            headerShadowVisible: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="project/[id]"
          options={{
            headerShown: true,
            title: 'Project Details',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: 'Settings',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            headerShadowVisible: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
