/**
 * Onboarding Screen 3: "One More Thing" (Well-Being)
 * Interactive reveal card about stress reduction benefits
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
  RevealCard,
} from './components';
import { OnboardingStorage } from '@/services/onboardingStorage';
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme';

export default function WellBeingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      // Mark Phase 1 & 2 as complete
      // In Phase 3 & 4, we'll collect quiz data before completing onboarding
      // For now, we'll just navigate back to home
      // TODO: Navigate to quiz screens when Phase 3 & 4 are implemented
      await OnboardingStorage.setOnboardingCompleted();
      router.replace('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
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
          <ProgressIndicator currentStep={3} totalSteps={5} />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <StrokedText fontSize={42} lineHeight={50}>
            One more thing 💛
          </StrokedText>
        </View>

        {/* Question */}
        <Text style={styles.question}>
          Did you know crocheting for just 15 minutes can help reduce stress?
        </Text>

        {/* Interactive Reveal Card */}
        <View style={styles.revealContainer}>
          <RevealCard
            hiddenText="Tap to Reveal Answer"
            revealedText="🧠 Repetitive, rhythmic activities like crochet can help lower stress levels by up to ~30%*"
          />
        </View>

        {/* Context */}
        <Text style={styles.context}>
          *Based on research into mindfulness and repetitive crafts
        </Text>

        {/* Emoji Visuals */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>💛</Text>
          <Text style={styles.emoji}>🧠</Text>
        </View>

        {/* CTA Button */}
        <CTAButton
          title="Continue"
          onPress={handleContinue}
          style={styles.ctaButton}
          loading={isLoading}
        />
      </ScrollView>

      {/* Personalization Bar */}
      <PersonalizationBar text="🧵 Designing a calmer crochet routine for you..." />
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
  question: {
    fontSize: FontSize.xl,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 32,
  },
  revealContainer: {
    marginBottom: Spacing.lg,
  },
  context: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  emoji: {
    fontSize: 48,
  },
  ctaButton: {
    width: '100%',
  },
});
