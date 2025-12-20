/**
 * Onboarding Screen 1: Welcome / Brand Promise
 * Neo-Brutalist design with large emoji and brand messaging
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StrokedText } from '@/components';
import {
  PersonalizationBar,
  ProgressIndicator,
  CTAButton,
} from './components';
import { Colors, Spacing, FontSize, Fonts, BorderRadius, Shadow } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    router.push('/onboarding/time-fact');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: 120, // Space for PersonalizationBar
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <ProgressIndicator currentStep={1} totalSteps={5} />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <StrokedText fontSize={FontSize.hero} lineHeight={56}>
            Welcome to{'\n'}Crochetly
          </StrokedText>
        </View>

        {/* Large Card with Emoji */}
        <View style={styles.card}>
          <Text style={styles.emoji}>🧘‍♀️</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          The #1 app for peaceful crochet and personalized patterns 🧘‍♀️🧶
        </Text>

        {/* Supporting Text */}
        <Text style={styles.supportingText}>
          Turn any photo into a crochet pattern made just for you.
        </Text>

        {/* CTA Button */}
        <CTAButton
          title="Get Started"
          onPress={handleGetStarted}
          style={styles.ctaButton}
        />
      </ScrollView>

      {/* Personalization Bar */}
      <PersonalizationBar text="Building your plan..." />
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
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  titleContainer: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.stroke,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    minHeight: 200,
    ...Shadow.brutal,
  },
  emoji: {
    fontSize: 120,
  },
  subtitle: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.light,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 26,
  },
  supportingText: {
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 24,
  },
  ctaButton: {
    width: '100%',
  },
});
