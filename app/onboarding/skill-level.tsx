/**
 * Onboarding Screen 4: Skill Level Quiz
 * Single-select quiz for user's crochet experience level
 */

import React, { useState } from 'react';
import {
  View,
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
  SelectableCard,
} from './components';
import { OnboardingStorage } from '@/services/onboardingStorage';
import { Colors, Spacing } from '@/constants/theme';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

const SKILL_OPTIONS = [
  {
    id: 'beginner' as SkillLevel,
    emoji: '🧶',
    title: 'Beginner',
    subtitle: 'just starting out',
  },
  {
    id: 'intermediate' as SkillLevel,
    emoji: '🪡',
    title: 'Intermediate',
    subtitle: 'I follow patterns',
  },
  {
    id: 'advanced' as SkillLevel,
    emoji: '🧵',
    title: 'Advanced',
    subtitle: 'I design or modify patterns',
  },
];

export default function SkillLevelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedLevel) return;

    try {
      setIsLoading(true);
      await OnboardingStorage.saveQuizData({ skillLevel: selectedLevel });
      router.push('/onboarding/creation-intent');
    } catch (error) {
      console.error('Error saving skill level:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate personalization bar height
  const personalizationBarHeight = 70 + insets.bottom;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: personalizationBarHeight + Spacing.xxl + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <ProgressIndicator currentStep={4} totalSteps={5} />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <StrokedText fontSize={38} lineHeight={46}>
            What&apos;s Your{'\n'}Crochet Level?
          </StrokedText>
        </View>

        {/* Skill Options */}
        <View style={styles.optionsContainer}>
          {SKILL_OPTIONS.map((option) => (
            <SelectableCard
              key={option.id}
              emoji={option.emoji}
              title={option.title}
              subtitle={option.subtitle}
              isSelected={selectedLevel === option.id}
              onPress={() => setSelectedLevel(option.id)}
            />
          ))}
        </View>

        {/* Flexible spacer */}
        <View style={{ flex: 1, minHeight: Spacing.md }} />

        {/* CTA Button - Always visible */}
        <CTAButton
          title="Continue"
          onPress={handleContinue}
          style={styles.ctaButton}
          disabled={!selectedLevel}
          loading={isLoading}
        />
      </ScrollView>

      {/* Personalization Bar */}
      <PersonalizationBar text="🧵 Adjusting pattern complexity to your level..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  optionsContainer: {
    marginBottom: Spacing.md,
  },
  ctaButton: {
    width: '100%',
  },
});
