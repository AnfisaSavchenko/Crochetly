/**
 * Project Card Component
 * Displays a project summary in the gallery
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/theme';
import { ProjectSummary, ProjectStatus } from '@/types/project';

interface ProjectCardProps {
  project: ProjectSummary;
  onPress: (project: ProjectSummary) => void;
  style?: ViewStyle;
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  draft: { label: 'Draft', color: Colors.textLight, icon: 'document-outline' },
  in_progress: { label: 'In Progress', color: Colors.primary, icon: 'construct-outline' },
  completed: { label: 'Completed', color: Colors.success, icon: 'checkmark-circle-outline' },
  archived: { label: 'Archived', color: Colors.textLight, icon: 'archive-outline' },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPress,
  style,
}) => {
  const statusConfig = STATUS_CONFIG[project.status];
  const hasProgress = typeof project.progressPercentage === 'number';

  return (
    <TouchableOpacity
      onPress={() => onPress(project)}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {project.thumbnailUri ? (
          <Image
            source={{ uri: project.thumbnailUri }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Ionicons name="image-outline" size={32} color={Colors.textLight} />
          </View>
        )}

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
          <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {project.name}
        </Text>

        {/* Progress Bar */}
        {hasProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${project.progressPercentage ?? 0}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(project.progressPercentage ?? 0)}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.small,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginLeft: 4,
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginLeft: Spacing.sm,
    minWidth: 32,
  },
});

export default ProjectCard;
