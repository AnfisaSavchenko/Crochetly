/**
 * Onboarding Layout
 * Stack navigation with horizontal slide transitions
 */

import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right', // Smooth horizontal slide
        gestureEnabled: false, // Disable swipe back to prevent skipping
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="time-fact" />
      <Stack.Screen name="well-being" />
      <Stack.Screen name="skill-level" />
      <Stack.Screen name="creation-intent" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}
