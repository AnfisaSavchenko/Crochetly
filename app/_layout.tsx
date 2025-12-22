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
import { Colors } from '@/constants/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'SFUIText-Heavy': require('../assets/fonts/SFUIText-Heavy.ttf'),
    'SFUIText-Light': require('../assets/fonts/SFUIText-Light.ttf'),
  });

  // Handle OAuth callback from @fastshot/auth
  const { isProcessing } = useAuthCallback({
    supabaseClient: supabase,
    onSuccess: async ({ user }) => {
      console.log('Auth successful for user:', user.email);
      try {
        // Save user profile with quiz data and mark onboarding complete
        await AuthService.saveUserProfileAfterAuth(user.id);
        // Navigation to home will happen automatically via the redirect check in index.tsx
      } catch (error) {
        console.error('Error saving user profile after auth:', error);
        Alert.alert('Error', 'Failed to save your profile. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Auth callback error:', error);
      Alert.alert('Authentication Error', error.message || 'Failed to complete sign in');
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
