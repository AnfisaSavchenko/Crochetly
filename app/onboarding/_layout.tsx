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
      <Stack.Screen name="fact-stress" />
      <Stack.Screen name="fact-teapot" />
      <Stack.Screen name="fact-airplane" />
      <Stack.Screen name="quiz-level" />
      <Stack.Screen name="quiz-skills" />
      <Stack.Screen name="quiz-target" />
      <Stack.Screen name="quiz-motivation" />
      <Stack.Screen name="loading" />
      <Stack.Screen name="paywall" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}
