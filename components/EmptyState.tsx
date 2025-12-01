/**
 * Empty State Component
 * Neo-Brutalist "Retro Pop" design
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, FontSize, Fonts, BorderRadius, NeoBrutalist } from '@/constants/theme';

interface EmptyStateProps {
  title?: string;
  message?: string;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No projects yet!",
  message = "Tap the + button to create your first crochet pattern",
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Illustration - Yarn emoji in a card */}
      <View style={styles.illustrationCard}>
        <Text style={styles.emoji}>🧶</Text>
      </View>

      {/* Text Content */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100, // Account for FAB
  },
  illustrationCard: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: FontSize.xl,
    fontFamily: Fonts.heavy,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    // Stroke effect
    textShadowColor: Colors.stroke,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0.5,
  },
  message: {
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
});

export default EmptyState;
