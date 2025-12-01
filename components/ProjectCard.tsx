/**
 * Project Card Component
 * Neo-Brutalist style - Off-white card with black border
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Text,
} from 'react-native';
import { Image } from 'expo-image';
import { Colors, Spacing, FontSize, BorderRadius, NeoBrutalist } from '@/constants/theme';
import { ProjectSummary } from '@/types/project';
import { StrokedText } from './StrokedText';

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

      {/* Title - Centered at bottom with stroked text */}
      <View style={styles.titleContainer}>
        <StrokedText
          fontSize={FontSize.md}
          lineHeight={22}
          numberOfLines={1}
        >
          {project.name}
        </StrokedText>
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
});

export default ProjectCard;
