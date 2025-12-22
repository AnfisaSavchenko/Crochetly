/**
 * SelectableCard Component
 * Single-select card with emoji for quiz questions
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Colors, Spacing, FontSize, Fonts, BorderRadius, Shadow } from '@/constants/theme';

interface SelectableCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  isSelected: boolean;
  onPress: () => void;
}

export const SelectableCard: React.FC<SelectableCardProps> = ({
  emoji,
  title,
  subtitle,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.stroke,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.brutal,
  },
  cardSelected: {
    borderWidth: 3,
    borderColor: Colors.stroke,
    backgroundColor: Colors.primaryLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emoji: {
    fontSize: 48,
    marginRight: Spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
