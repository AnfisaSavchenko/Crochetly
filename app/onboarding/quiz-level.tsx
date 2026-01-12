/**
 * Onboarding Screen 4: Quiz - Crochet Level
 * User selects their experience level
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

type LevelOption = 'brand_new' | 'know_some' | 'confident' | 'personality';

const LEVEL_OPTIONS = [
  { id: 'brand_new' as LevelOption, emoji: '🧶', label: "I'm brand new" },
  { id: 'know_some' as LevelOption, emoji: '🧵', label: 'I know a stitch or two' },
  { id: 'confident' as LevelOption, emoji: '🪡', label: 'Confident but curious' },
  { id: 'personality' as LevelOption, emoji: '🔥', label: 'Crochet is my personality' },
];

export default function QuizLevelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedLevel, setSelectedLevel] = useState<LevelOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedLevel) return;

    try {
      setIsLoading(true);
      await OnboardingStorage.saveQuizData({ level: selectedLevel });
      router.push('/onboarding/quiz-skills');
    } catch (error) {
      console.error('Error saving level:', error);
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
            What is your{'\n'}crochet level?
          </StrokedText>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {LEVEL_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedLevel === option.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedLevel(option.id)}
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
        {selectedLevel && (
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
