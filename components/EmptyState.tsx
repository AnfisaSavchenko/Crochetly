/**
 * Empty State Component
 * Displays a friendly illustration and message when there are no projects
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/theme';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Hook your first Genie!",
  message = "Start your crochet journey by creating your first project. Tap the + button below to begin.",
  icon = 'color-wand-outline',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Illustration Container */}
      <View style={styles.illustrationContainer}>
        {/* Decorative yarn ball circles */}
        <View style={styles.yarnBall}>
          <View style={styles.yarnBallInner}>
            <Ionicons name={icon} size={48} color={Colors.primary} />
          </View>
        </View>

        {/* Decorative elements */}
        <View style={[styles.decorativeCircle, styles.circleTopLeft]} />
        <View style={[styles.decorativeCircle, styles.circleTopRight]} />
        <View style={[styles.decorativeCircle, styles.circleBottom]} />

        {/* Yarn strand decorations */}
        <View style={styles.yarnStrand1} />
        <View style={styles.yarnStrand2} />
      </View>

      {/* Text Content */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {/* Hint */}
      <View style={styles.hintContainer}>
        <Ionicons name="sparkles" size={16} color={Colors.secondary} />
        <Text style={styles.hintText}>Your projects will appear here</Text>
      </View>
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
  illustrationContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  yarnBall: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primaryLight,
    borderStyle: 'dashed',
  },
  yarnBallInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 50,
  },
  circleTopLeft: {
    width: 24,
    height: 24,
    backgroundColor: Colors.secondary,
    opacity: 0.6,
    top: 10,
    left: 20,
  },
  circleTopRight: {
    width: 16,
    height: 16,
    backgroundColor: Colors.primary,
    opacity: 0.5,
    top: 20,
    right: 25,
  },
  circleBottom: {
    width: 20,
    height: 20,
    backgroundColor: Colors.secondaryLight,
    opacity: 0.7,
    bottom: 15,
    left: 35,
  },
  yarnStrand1: {
    position: 'absolute',
    width: 40,
    height: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 2,
    bottom: 30,
    right: 15,
    transform: [{ rotate: '-30deg' }],
  },
  yarnStrand2: {
    position: 'absolute',
    width: 30,
    height: 3,
    backgroundColor: Colors.secondaryLight,
    borderRadius: 2,
    top: 40,
    left: 10,
    transform: [{ rotate: '20deg' }],
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
  },
  hintText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginLeft: Spacing.xs,
  },
});

export default EmptyState;
