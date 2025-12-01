/**
 * Home Screen - Project Gallery Dashboard
 * Displays all projects with empty state for new users
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FAB, EmptyState, ProjectCard } from '@/components';
import { ProjectStorage } from '@/services/storage';
import { ProjectSummary } from '@/types/project';
import { Colors, Spacing, FontSize, FontWeight, Shadow } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_MARGIN = Spacing.sm;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - Spacing.lg * 2 - CARD_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load projects on mount
  const loadProjects = useCallback(async () => {
    try {
      const summaries = await ProjectStorage.getProjectSummaries();
      setProjects(summaries);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadProjects();
    setIsRefreshing(false);
  }, [loadProjects]);

  // Navigate to create new project
  const handleNewProject = useCallback(() => {
    router.push('/project/new');
  }, [router]);

  // Navigate to project details
  const handleProjectPress = useCallback((project: ProjectSummary) => {
    router.push(`/project/${project.id}`);
  }, [router]);

  // Render project card
  const renderProjectCard = useCallback(({ item, index }: { item: ProjectSummary; index: number }) => {
    const isLeftColumn = index % NUM_COLUMNS === 0;
    return (
      <ProjectCard
        project={item}
        onPress={handleProjectPress}
        style={{
          ...styles.card,
          width: CARD_WIDTH,
          ...(isLeftColumn ? styles.cardLeft : styles.cardRight),
        }}
      />
    );
  }, [handleProjectPress]);

  // Key extractor
  const keyExtractor = useCallback((item: ProjectSummary) => item.id, []);

  const hasProjects = projects.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome to</Text>
          <View style={styles.titleContainer}>
            <Ionicons name="color-wand" size={28} color={Colors.primary} />
            <Text style={styles.title}>Hookgenie</Text>
          </View>
        </View>

        {hasProjects && (
          <View style={styles.projectCount}>
            <Text style={styles.countNumber}>{projects.length}</Text>
            <Text style={styles.countLabel}>
              {projects.length === 1 ? 'Project' : 'Projects'}
            </Text>
          </View>
        )}
      </View>

      {/* Project Gallery Section Header */}
      {hasProjects && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Project Gallery</Text>
          <Ionicons name="grid-outline" size={20} color={Colors.textSecondary} />
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      ) : hasProjects ? (
        <FlatList
          data={projects}
          renderItem={renderProjectCard}
          keyExtractor={keyExtractor}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.gallery}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      ) : (
        <EmptyState />
      )}

      {/* Floating Action Button */}
      <FAB
        onPress={handleNewProject}
        icon="add"
        style={{ bottom: insets.bottom + 24 }}
        testID="new-project-fab"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  projectCount: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    ...Shadow.small,
  },
  countNumber: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  countLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  gallery: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100, // Account for FAB
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardLeft: {
    marginRight: CARD_MARGIN / 2,
  },
  cardRight: {
    marginLeft: CARD_MARGIN / 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
