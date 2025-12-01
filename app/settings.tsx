/**
 * Settings Screen
 * Neo-Brutalist "Retro Pop" design
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
import { StrokedText } from '@/components';
import {
  Colors,
  Spacing,
  FontSize,
  Fonts,
  BorderRadius,
  NeoBrutalist,
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
  iconColor = Colors.text,
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
      <View style={styles.iconContainer}>
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
        <Ionicons name="chevron-forward" size={20} color={Colors.text} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
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
          <StrokedText fontSize={FontSize.xl} strokeWidth={1}>
            App Info
          </StrokedText>
          <View style={styles.sectionContent}>
            <View style={styles.appInfoHeader}>
              <View style={styles.appIconContainer}>
                <Text style={styles.appEmoji}>🧶</Text>
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
          <StrokedText fontSize={FontSize.xl} strokeWidth={1}>
            Data
          </StrokedText>
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
          <StrokedText fontSize={FontSize.xl} strokeWidth={1}>
            Preferences
          </StrokedText>
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
            Preference editing coming soon
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Hookgenie {APP_VERSION}
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
  sectionContent: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
  },
  sectionHint: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
  },
  appEmoji: {
    fontSize: 28,
  },
  appInfoText: {
    flex: 1,
  },
  appName: {
    fontSize: FontSize.xl,
    fontFamily: Fonts.heavy,
    color: Colors.text,
  },
  appTagline: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.light,
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
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.stroke,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
    color: Colors.text,
  },
  rowSubtitle: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowValue: {
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
  },
  destructiveText: {
    color: Colors.error,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.stroke,
    marginLeft: Spacing.lg + 36 + Spacing.md,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
  },
});
