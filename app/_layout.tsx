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
import { LoadingScreen } from '@/components/LoadingScreen';
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
      console.log('═══════════════════════════════════════');
      console.log('✅ OAuth sign-in successful!');
      console.log('   User ID:', user.id);
      console.log('   Email:', user.email);

      try {
        // Save user profile with quiz data
        console.log('💾 Saving user profile...');
        await AuthService.saveUserProfileAfterAuth(user.id);
        console.log('✅ User profile saved to database');

        // Give time for state to propagate through the app
        console.log('⏳ Waiting for state synchronization...');
        await new Promise(resolve => setTimeout(resolve, 800));

        // Navigate to main screen
        console.log('🚀 Redirecting to Main Screen (Dashboard)');
        console.log('═══════════════════════════════════════');

        // Clear the navigation stack and go to root
        router.replace('/');
      } catch (error) {
        console.error('═══════════════════════════════════════');
        console.error('❌ Error during profile save:', error);
        if (error instanceof Error) {
          console.error('   Error:', error.message);
        }
        console.error('═══════════════════════════════════════');

        // Navigate anyway - the user is authenticated
        router.replace('/');
      }
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

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔔 Auth state change: ${event}`);
      if (session?.user) {
        console.log('   User ID:', session.user.id);
        console.log('   Email:', session.user.email);
      }
      // Profile saving is handled by useAuthCallback onSuccess
      // This listener is just for logging and monitoring
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

  // Show loading state while fonts and images load
  if ((!fontsLoaded && !fontError) || !imagesPreloaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Show "Preparing workspace" during auth processing
  if (isAuthProcessing) {
    return <LoadingScreen message="Preparing your workspace... ✨" />;
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
