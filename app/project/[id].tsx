/**
 * Project Details Screen
 * Placeholder for viewing and editing a project
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProjectStorage } from '@/services/storage';
import { Project } from '@/types/project';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/theme';

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (project) {
      navigation.setOptions({
        title: project.name,
      });
    }
  }, [project, navigation]);

  const loadProject = async () => {
    if (!id) {
      setError('Project ID not found');
      setIsLoading(false);
      return;
    }

    try {
      const data = await ProjectStorage.getProject(id);
      if (data) {
        setProject(data);
      } else {
        setError('Project not found');
      }
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  if (error || !project) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        </View>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error || 'Project not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Coming Soon Placeholder */}
      <View style={styles.placeholderCard}>
        <Ionicons name="construct-outline" size={48} color={Colors.primary} />
        <Text style={styles.placeholderTitle}>Project Details</Text>
        <Text style={styles.placeholderText}>
          Full project view with editing, progress tracking, and AI suggestions coming soon!
        </Text>
      </View>

      {/* Basic Project Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Project Name</Text>
        <Text style={styles.infoValue}>{project.name}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Status</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{project.status.replace('_', ' ')}</Text>
        </View>
      </View>

      {project.description && (
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Description</Text>
          <Text style={styles.infoValue}>{project.description}</Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Created</Text>
        <Text style={styles.infoValue}>
          {new Date(project.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  errorIcon: {
    marginBottom: Spacing.md,
  },
  errorTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  placeholderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.small,
  },
  placeholderTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  placeholderText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.small,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight + '30',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
    textTransform: 'capitalize',
  },
});
