/**
 * Project Card Component
 * Neo-Brutalist style - Off-white card with black border
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
import { Colors, Spacing, FontSize, Fonts, BorderRadius, NeoBrutalist } from '@/constants/theme';
import { ProjectSummary } from '@/types/project';

interface ProjectCardProps {
  project: ProjectSummary;
  onPress: (project: ProjectSummary) => void;
  style?: ViewStyle;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(project)}
      activeOpacity={0.85}
      style={[styles.container, style]}
    >
      {/* Image Area - Takes most of card */}
      <View style={styles.imageContainer}>
        {project.thumbnailUri ? (
          <Image
            source={{ uri: project.thumbnailUri }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🧶</Text>
          </View>
        )}
      </View>

      {/* Title - Centered at bottom with stroked text effect */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {project.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.9,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  titleContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.heavy,
    fontSize: FontSize.md,
    color: Colors.primary,
    textAlign: 'center',
    // Text stroke effect via shadow
    textShadowColor: Colors.stroke,
    textShadowOffset: { width: 0.8, height: 0.8 },
    textShadowRadius: 0.5,
  },
});

export default ProjectCard;
