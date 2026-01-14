/**
 * Root Layout
 * Main navigation structure for Crochetly with custom font loading
 * Local-first: No authentication required
 */

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ImagePreloader } from '@/services/imagePreloader';
import { Colors } from '@/constants/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'SFUIText-Heavy': require('../assets/fonts/SFUIText-Heavy.ttf'),
    'SFUIText-Light': require('../assets/fonts/SFUIText-Light.ttf'),
  });

  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Preload images on mount
  useEffect(() => {
    const preloadImages = async () => {
      await ImagePreloader.preloadImages();
      setImagesPreloaded(true);
    };

    preloadImages();
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
