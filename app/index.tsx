/**
 * Home Screen - Project Gallery Dashboard
 * Neo-Brutalist "Retro Pop" design
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FAB, EmptyState, ProjectCard, StrokedText } from '@/components';
import { ProjectStorage } from '@/services/storage';
import { ProjectSummary } from '@/types/project';
import { Colors, Spacing, FontSize, Fonts, NeoBrutalist } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_MARGIN = Spacing.md;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - Spacing.lg * 2 - CARD_MARGIN) / NUM_COLUMNS;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load projects when screen gains focus
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

  // Use useFocusEffect to refresh projects when returning to this screen
  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects])
  );

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
          width: CARD_WIDTH,
          marginBottom: CARD_MARGIN,
          marginRight: isLeftColumn ? CARD_MARGIN / 2 : 0,
          marginLeft: isLeftColumn ? 0 : CARD_MARGIN / 2,
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

      {/* Header - Gallery Title with Stroked Text */}
      <View style={styles.header}>
        <StrokedText
          fontSize={FontSize.hero}
          textAlign="left"
        >
          Gallery
        </StrokedText>

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
  },
  gallery: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120, // Account for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
  },
});
