/**
 * New Project Screen
 * Placeholder for creating new crochet projects
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/theme';

export default function NewProjectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCreateProject = () => {
    // TODO: Implement project creation logic
    // For now, just go back
    router.back();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Coming Soon Placeholder */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="sparkles" size={64} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Create Your Project</Text>
        <Text style={styles.subtitle}>
          This is where the magic begins! Project creation features are coming soon.
        </Text>

        {/* Feature Preview */}
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>AI-powered pattern generation</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>Yarn & hook tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>Progress photos</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>Row counter & notes</Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateProject}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Coming Soon</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadow.small,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
    marginBottom: Spacing.xl,
  },
  featureList: {
    alignSelf: 'stretch',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.small,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  featureText: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginLeft: Spacing.md,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.medium,
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textOnPrimary,
  },
});
