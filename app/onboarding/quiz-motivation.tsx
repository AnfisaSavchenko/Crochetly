/**
 * Onboarding Screen 7: Quiz - Motivation
 * User selects why they want to crochet
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StrokedText } from '@/components';
import { CTAButton } from './components';
import { OnboardingStorage } from '@/services/onboardingStorage';
import { Colors, Spacing, FontSize, Fonts, BorderRadius, Shadow } from '@/constants/theme';

type MotivationOption = 'relax' | 'learn' | 'gifts' | 'sell';

const MOTIVATION_OPTIONS = [
  { id: 'relax' as MotivationOption, emoji: '😌', label: 'To relax and unwind' },
  { id: 'learn' as MotivationOption, emoji: '💡', label: 'To learn something new' },
  { id: 'gifts' as MotivationOption, emoji: '🎁', label: 'To make gifts' },
  { id: 'sell' as MotivationOption, emoji: '✨', label: 'To sell what I make' },
];

export default function QuizMotivationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedMotivation, setSelectedMotivation] = useState<MotivationOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedMotivation) return;

    try {
      setIsLoading(true);
      await OnboardingStorage.saveQuizData({ motivation: selectedMotivation });
      router.push('/onboarding/loading');
    } catch (error) {
      console.error('Error saving motivation:', error);
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
            paddingTop: insets.top + Spacing.xxl,
            paddingBottom: insets.bottom + Spacing.xxl + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Title */}
        <View style={styles.titleContainer}>
          <StrokedText fontSize={36} lineHeight={44}>
            Why crochet{'\n'}right now?
          </StrokedText>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {MOTIVATION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedMotivation === option.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedMotivation(option.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Flexible spacer */}
        <View style={{ flex: 1, minHeight: Spacing.xl }} />

        {/* Continue Button */}
        {selectedMotivation && (
          <CTAButton
            title="Continue"
            onPress={handleContinue}
            style={styles.button}
            loading={isLoading}
          />
        )}
      </ScrollView>
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
  titleContainer: {
    marginBottom: Spacing.xxl,
    alignItems: 'center',
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionCard: {
    backgroundColor: Colors.card,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.stroke,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadow.brutal,
  },
  optionCardSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  optionLabel: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.light,
    color: Colors.text,
    flex: 1,
  },
  button: {
    width: '100%',
  },
});
