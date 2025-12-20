/**
 * MultiSelectCard Component
 * Multi-select card with emoji for creation intent quiz
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Fonts, BorderRadius, Shadow } from '@/constants/theme';

interface MultiSelectCardProps {
  emoji: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export const MultiSelectCard: React.FC<MultiSelectCardProps> = ({
  emoji,
  label,
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
      {isSelected && (
        <View style={styles.checkmark}>
          <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />
        </View>
      )}
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.stroke,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    position: 'relative',
    ...Shadow.brutal,
  },
  cardSelected: {
    borderWidth: 2.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    textAlign: 'center',
  },
});
