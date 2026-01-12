/**
 * Onboarding Screen 8: Loading/Preparation
 * Animated loading screen with progress indicator
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StrokedText } from '@/components';
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme';

export default function LoadingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    // Fade in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress animation
    const duration = 3000; // 3 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(Math.floor(newProgress));

      if (currentStep >= steps) {
        clearInterval(timer);
        // Navigate to auth screen after loading completes
        setTimeout(() => {
          router.push('/onboarding/auth');
        }, 500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [router, fadeAnim, scaleAnim]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.xxl }]}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <StrokedText fontSize={36} lineHeight={44}>
          We're preparing{'\n'}your crochet{'\n'}journey.{'\n'}Just a moment.
        </StrokedText>
      </View>

      {/* Cloud Image with Progress */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Cloud Placeholder */}
        <View style={styles.cloudContainer}>
          <Text style={styles.cloudEmoji}>☁️</Text>
        </View>

        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </View>
      </Animated.View>

      {/* Helper Text */}
      <Text style={styles.helperText}>
        Customizing patterns just for you...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: Spacing.xxl * 2,
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl * 2,
  },
  cloudContainer: {
    marginBottom: Spacing.xl,
  },
  cloudEmoji: {
    fontSize: 200,
  },
  progressContainer: {
    position: 'absolute',
    bottom: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.stroke,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: FontSize.xxl,
    fontFamily: Fonts.heavy,
    color: Colors.text,
  },
  helperText: {
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
