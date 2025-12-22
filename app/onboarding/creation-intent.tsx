/**
 * Onboarding Screen 5: Creation Intent Quiz
 * Multi-select quiz for what users want to create
 */

import React, { useState } from 'react';
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
  MultiSelectCard,
} from './components';
import { OnboardingStorage } from '@/services/onboardingStorage';
import { Colors, Spacing, FontSize, Fonts } from '@/constants/theme';

type IntentCategory = 'pets' | 'portraits' | 'toys' | 'home' | 'gifts';

const INTENT_OPTIONS = [
  { id: 'pets' as IntentCategory, emoji: '🐶', label: 'Pets' },
  { id: 'portraits' as IntentCategory, emoji: '🧑', label: 'Portraits' },
  { id: 'toys' as IntentCategory, emoji: '🧸', label: 'Toys / Amigurumi' },
  { id: 'home' as IntentCategory, emoji: '🛋️', label: 'Blankets & Home' },
  { id: 'gifts' as IntentCategory, emoji: '🎁', label: 'Gifts' },
];

const MAX_SELECTIONS = 2;

export default function CreationIntentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedIntents, setSelectedIntents] = useState<IntentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleIntent = (intent: IntentCategory) => {
    setSelectedIntents((prev) => {
      if (prev.includes(intent)) {
        // Deselect
        return prev.filter((i) => i !== intent);
      } else {
        // Select (max 2)
        if (prev.length >= MAX_SELECTIONS) {
          return prev;
        }
        return [...prev, intent];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedIntents.length === 0) return;

    try {
      setIsLoading(true);
      await OnboardingStorage.saveQuizData({ intent: selectedIntents.join(',') });
      router.push('/onboarding/auth');
    } catch (error) {
      console.error('Error saving creation intent:', error);
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
            paddingBottom: personalizationBarHeight + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <ProgressIndicator currentStep={5} totalSteps={5} />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <StrokedText fontSize={38} lineHeight={46}>
            What Do You Want{'\n'}to Create?
          </StrokedText>
        </View>

        {/* Hint */}
        <Text style={styles.hint}>
          Select up to {MAX_SELECTIONS} categories
        </Text>

        {/* Grid of Options */}
        <View style={styles.grid}>
          {INTENT_OPTIONS.map((option) => (
            <View key={option.id} style={styles.gridItem}>
              <MultiSelectCard
                emoji={option.emoji}
                label={option.label}
                isSelected={selectedIntents.includes(option.id)}
                onPress={() => handleToggleIntent(option.id)}
              />
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <CTAButton
          title="Create My Crochet Plan"
          onPress={handleContinue}
          style={styles.ctaButton}
          disabled={selectedIntents.length === 0}
          loading={isLoading}
        />
      </ScrollView>

      {/* Personalization Bar */}
      <PersonalizationBar text="🧵 Preparing examples and patterns you'll love..." />
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
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  hint: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
    marginBottom: Spacing.xl,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
  },
  ctaButton: {
    width: '100%',
  },
});
