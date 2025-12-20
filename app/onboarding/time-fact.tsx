/**
 * Onboarding Screen 2: "Did You Know?" (Time Fact)
 * Interactive reveal card about time investment
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
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme';

export default function TimeFactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    router.push('/onboarding/well-being');
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
          <ProgressIndicator currentStep={2} totalSteps={5} />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <StrokedText fontSize={42} lineHeight={50}>
            Did you know? 🤯
          </StrokedText>
        </View>

        {/* Question */}
        <Text style={styles.question}>
          While crocheting a sweater...
        </Text>

        {/* Interactive Reveal Card */}
        <View style={styles.revealContainer}>
          <RevealCard
            hiddenText="Tap to Reveal Answer"
            revealedText="✈️ You could fly from New York to London — and still have yarn left to go."
          />
        </View>

        {/* Context */}
        <Text style={styles.context}>
          A handmade sweater typically takes 20-40 hours to complete. That&apos;s dedication! 🧶
        </Text>

        {/* CTA Button */}
        <CTAButton
          title="Continue"
          onPress={handleContinue}
          style={styles.ctaButton}
        />
      </ScrollView>

      {/* Personalization Bar */}
      <PersonalizationBar text="🧵 Learning your crochet pace..." />
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
    marginBottom: Spacing.xl,
  },
  context: {
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
