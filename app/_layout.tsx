/**
 * Root Layout
 * Main navigation structure for Crochetly with custom font loading and auth callback handling
 */

import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthCallback } from '@fastshot/auth';
import { supabase } from '@/services/supabaseClient';
import { AuthService } from '@/services/authService';
import { ImagePreloader } from '@/services/imagePreloader';
import { Colors } from '@/constants/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts({
    'SFUIText-Heavy': require('../assets/fonts/SFUIText-Heavy.ttf'),
    'SFUIText-Light': require('../assets/fonts/SFUIText-Light.ttf'),
  });

  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Handle OAuth callbacks from Auth Broker
  const { isProcessing: isAuthProcessing } = useAuthCallback({
    supabaseClient: supabase,
    onSuccess: async ({ user }) => {
      console.log('✅ OAuth sign-in successful');
      console.log('   User ID:', user.id);
      console.log('   Email:', user.email);

      try {
        // Save user profile with quiz data
        await AuthService.saveUserProfileAfterAuth(user.id);
        console.log('✅ User profile saved successfully');
      } catch (error) {
        console.error('❌ Error saving user profile:', error);
      }

      // Navigate to home
      router.replace('/');
    },
    onError: (error) => {
      console.error('❌ OAuth callback error:', error);
      Alert.alert(
        'Sign-In Failed',
        error.message || 'An error occurred during sign-in. Please try again.'
      );
    },
  });

  // Preload images on mount
  useEffect(() => {
    const preloadImages = async () => {
      await ImagePreloader.preloadImages();
      setImagesPreloaded(true);
    };

    preloadImages();
  }, []);

  // Listen for auth state changes and save user profile
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('=== User Signed In ===');
        console.log('User ID:', session.user.id);
        console.log('User Email:', session.user.email);

        try {
          // Save user profile with quiz data
          await AuthService.saveUserProfileAfterAuth(session.user.id);
          console.log('✅ User profile saved successfully');
        } catch (error) {
          console.error('❌ Error saving user profile:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Hide splash screen only when both fonts and images are ready
  useEffect(() => {
    if ((fontsLoaded || fontError) && imagesPreloaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, imagesPreloaded]);

  // Show loading state while fonts and images load, or during auth processing
  if ((!fontsLoaded && !fontError) || !imagesPreloaded || isAuthProcessing) {
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
