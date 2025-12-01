/**
 * Settings Screen
 * App configuration, data management, and preferences
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ProjectStorage } from '@/services/storage';
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  BorderRadius,
  Shadow,
} from '@/constants/theme';

const APP_VERSION = '1.0.0';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isDestructive?: boolean;
  isLoading?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconColor = Colors.primary,
  title,
  subtitle,
  value,
  onPress,
  showChevron = false,
  isDestructive = false,
  isLoading = false,
}) => {
  const content = (
    <View style={styles.settingsRow}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, isDestructive && styles.destructiveText]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {isLoading ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : value ? (
        <Text style={styles.rowValue}>{value}</Text>
      ) : showChevron ? (
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);

  // Handle clear all data
  const handleClearAllData = useCallback(async () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your projects and cannot be undone. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await ProjectStorage.clearAllProjects();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(
                'Data Cleared',
                'All projects have been deleted.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/'),
                  },
                ]
              );
            } catch (error) {
              console.error('Error clearing data:', error);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  }, [router]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          <View style={styles.sectionContent}>
            <View style={styles.appInfoHeader}>
              <View style={styles.appIconContainer}>
                <Ionicons name="color-wand" size={32} color={Colors.primary} />
              </View>
              <View style={styles.appInfoText}>
                <Text style={styles.appName}>Hookgenie</Text>
                <Text style={styles.appTagline}>AI-Powered Crochet Patterns</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <SettingsRow
              icon="information-circle-outline"
              title="Version"
              value={APP_VERSION}
            />
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon="trash-outline"
              iconColor={Colors.error}
              title="Clear All Data"
              subtitle="Delete all projects permanently"
              onPress={handleClearAllData}
              isDestructive
              isLoading={isClearing}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon="scale-outline"
              title="Default Yarn Weight"
              value="Worsted"
              showChevron
            />
            <View style={styles.divider} />
            <SettingsRow
              icon="git-commit-outline"
              title="Default Hook Size"
              value="5.0mm"
              showChevron
            />
          </View>
          <Text style={styles.sectionHint}>
            Preference editing coming in a future update
          </Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon="heart-outline"
              iconColor={Colors.secondary}
              title="Made with love for crafters"
              subtitle="Powered by Newell AI"
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Hookgenie {APP_VERSION}
          </Text>
          <Text style={styles.footerSubtext}>
            Transform any photo into a crochet pattern
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Section Styles
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.small,
  },
  sectionHint: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
    marginLeft: Spacing.xs,
  },

  // App Info Styles
  appInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  appIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  appInfoText: {
    flex: 1,
  },
  appName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  appTagline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Row Styles
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  rowSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowValue: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  destructiveText: {
    color: Colors.error,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: Spacing.lg + 36 + Spacing.md, // Align with text
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textLight,
  },
  footerSubtext: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
});
