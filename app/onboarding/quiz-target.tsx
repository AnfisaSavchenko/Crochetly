/**
 * Onboarding Screen 6: Quiz - Creation Target
 * User selects what they want to create
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

type TargetOption = 'photos' | 'cute_guys' | 'cozy' | 'home' | 'gifts';

const TARGET_OPTIONS = [
  { id: 'photos' as TargetOption, emoji: '📸', label: 'Things I take photo of' },
  { id: 'cute_guys' as TargetOption, emoji: '🧸', label: 'Cute little guys' },
  { id: 'cozy' as TargetOption, emoji: '🧣', label: 'Cozy basics\n(scarves etc.)' },
  { id: 'home' as TargetOption, emoji: '🏠', label: 'Home stuff' },
  { id: 'gifts' as TargetOption, emoji: '🎁', label: 'trendy gifts' },
];

export default function QuizTargetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedTarget, setSelectedTarget] = useState<TargetOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedTarget) return;

    try {
      setIsLoading(true);
      await OnboardingStorage.saveQuizData({ target: selectedTarget });
      router.push('/onboarding/quiz-motivation');
    } catch (error) {
      console.error('Error saving target:', error);
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
            What do you want{'\n'}to create{'\n'}in Crochetly?
          </StrokedText>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {TARGET_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedTarget === option.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedTarget(option.id)}
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
        {selectedTarget && (
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
