/**
 * ProgressIndicator Component
 * Pill-shaped progress indicator showing current step
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, Fonts, NeoBrutalist, BorderRadius } from '@/constants/theme';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.heavy,
    color: Colors.text,
  },
});
