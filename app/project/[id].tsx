/**
 * Pattern Studio Screen
 * Interactive workspace for viewing and working on crochet patterns
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  Modal,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProjectStorage } from '@/services/storage';
import {
  Project,
  PatternSection,
  PatternRow,
  DifficultyLevel,
} from '@/types/project';
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  BorderRadius,
  Shadow,
} from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'visuals' | 'pattern';

// Difficulty color mapping
const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  beginner: '#81C784',
  easy: '#AED581',
  intermediate: '#FFB74D',
  advanced: '#FF8A65',
  expert: '#E57373',
};

// Toast notification component
interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'info';
}

const Toast: React.FC<ToastProps> = ({ visible, message, type }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.toast,
        type === 'success' ? styles.toastSuccess : styles.toastInfo,
        { transform: [{ translateY }], opacity },
      ]}
      pointerEvents="none"
    >
      <Ionicons
        name={type === 'success' ? 'checkmark-circle' : 'information-circle'}
        size={20}
        color={Colors.textOnPrimary}
      />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

// Pattern Row Component
interface PatternRowItemProps {
  row: PatternRow;
  index: number;
  onToggle: () => void;
  onEdit: () => void;
}

const PatternRowItem: React.FC<PatternRowItemProps> = ({
  row,
  index,
  onToggle,
  onEdit,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.patternRow, row.isCompleted && styles.patternRowCompleted]}
        onPress={handlePress}
        onLongPress={onEdit}
        activeOpacity={0.7}
      >
        <View style={styles.rowCheckbox}>
          {row.isCompleted ? (
            <View style={styles.checkboxChecked}>
              <Ionicons name="checkmark" size={14} color={Colors.textOnPrimary} />
            </View>
          ) : (
            <View style={styles.checkboxUnchecked}>
              <Text style={styles.rowNumber}>{index + 1}</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.rowInstruction,
            row.isCompleted && styles.rowInstructionCompleted,
          ]}
        >
          {row.instruction}
        </Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="pencil-outline" size={16} color={Colors.textLight} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Section Header with progress
interface SectionHeaderProps {
  section: PatternSection;
  isExpanded: boolean;
  onToggle: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  section,
  isExpanded,
  onToggle,
}) => {
  const completedRows = section.rows.filter((r) => r.isCompleted).length;
  const totalRows = section.rows.length;
  const progress = totalRows > 0 ? (completedRows / totalRows) * 100 : 0;
  const isComplete = completedRows === totalRows && totalRows > 0;

  return (
    <TouchableOpacity
      style={[styles.sectionHeader, isComplete && styles.sectionHeaderComplete]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.sectionHeaderLeft}>
        <Ionicons
          name={isExpanded ? 'chevron-down' : 'chevron-forward'}
          size={20}
          color={isComplete ? Colors.success : Colors.primary}
        />
        <Text style={[styles.sectionTitle, isComplete && styles.sectionTitleComplete]}>
          {section.name}
        </Text>
        {isComplete && (
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={Colors.success}
            style={styles.sectionCheckmark}
          />
        )}
      </View>
      <View style={styles.sectionProgress}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completedRows}/{totalRows}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Edit Modal Component
interface EditModalProps {
  visible: boolean;
  instruction: string;
  onSave: (newInstruction: string) => void;
  onCancel: () => void;
}

const EditModal: React.FC<EditModalProps> = ({
  visible,
  instruction,
  onSave,
  onCancel,
}) => {
  const [text, setText] = useState(instruction);

  useEffect(() => {
    setText(instruction);
  }, [instruction]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.modalOverlay} onPress={onCancel}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Edit Instruction</Text>
          <TextInput
            style={styles.modalInput}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            placeholder="Enter instruction..."
            placeholderTextColor={Colors.textLight}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButtonCancel} onPress={onCancel}>
              <Text style={styles.modalButtonCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonSave}
              onPress={() => onSave(text)}
            >
              <Text style={styles.modalButtonSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// Main Screen Component
export default function PatternStudioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('visuals');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<ToastProps>({
    visible: false,
    message: '',
    type: 'success',
  });
  const [editModal, setEditModal] = useState<{
    visible: boolean;
    sectionId: string;
    rowId: string;
    instruction: string;
  }>({
    visible: false,
    sectionId: '',
    rowId: '',
    instruction: '',
  });

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load project data
  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Handle project deletion
  const handleDeleteProject = useCallback(() => {
    if (!project) return;

    Alert.alert(
      'Delete this project?',
      'This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProjectStorage.deleteProject(project.id);
              router.replace('/');
            } catch (err) {
              console.error('Error deleting project:', err);
              Alert.alert('Error', 'Failed to delete project. Please try again.');
            }
          },
        },
      ]
    );
  }, [project, router]);

  // Set navigation title
  useEffect(() => {
    if (project) {
      navigation.setOptions({
        title: project.name,
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleDeleteProject}
            >
              <Ionicons name="trash-outline" size={22} color={Colors.error} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                // Future: Share functionality
              }}
            >
              <Ionicons name="share-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [project, navigation, handleDeleteProject]);

  // Auto-expand first section on load
  useEffect(() => {
    if (project?.structuredPattern?.sections.length) {
      const firstIncomplete = project.structuredPattern.sections.find(
        (s) => s.rows.some((r) => !r.isCompleted)
      );
      if (firstIncomplete) {
        setExpandedSections(new Set([firstIncomplete.id]));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]); // Only on initial load, not when sections change

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

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  }, []);

  // Save project with debouncing
  const saveProject = useCallback(
    async (updatedProject: Project) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await ProjectStorage.updateProject(updatedProject.id, updatedProject);
        } catch (err) {
          console.error('Error saving project:', err);
        }
      }, 500);
    },
    []
  );

  // Calculate progress percentage
  const calculateProgress = useCallback((sections: PatternSection[]): number => {
    const totalRows = sections.reduce((sum, s) => sum + s.rows.length, 0);
    const completedRows = sections.reduce(
      (sum, s) => sum + s.rows.filter((r) => r.isCompleted).length,
      0
    );
    return totalRows > 0 ? Math.round((completedRows / totalRows) * 100) : 0;
  }, []);

  // Toggle row completion
  const toggleRow = useCallback(
    (sectionId: string, rowId: string) => {
      if (!project?.structuredPattern) return;

      const updatedSections = project.structuredPattern.sections.map((section) => {
        if (section.id !== sectionId) return section;

        const updatedRows = section.rows.map((row) => {
          if (row.id !== rowId) return row;
          return {
            ...row,
            isCompleted: !row.isCompleted,
            completedAt: !row.isCompleted ? new Date().toISOString() : undefined,
          };
        });

        return { ...section, rows: updatedRows };
      });

      // Check if section was just completed
      const updatedSection = updatedSections.find((s) => s.id === sectionId);
      const wasJustCompleted =
        updatedSection &&
        updatedSection.rows.every((r) => r.isCompleted) &&
        project.structuredPattern.sections
          .find((s) => s.id === sectionId)
          ?.rows.some((r) => !r.isCompleted);

      const newProgress = calculateProgress(updatedSections);

      const updatedProject: Project = {
        ...project,
        structuredPattern: {
          ...project.structuredPattern,
          sections: updatedSections,
        },
        progressPercentage: newProgress,
        status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'draft',
      };

      setProject(updatedProject);
      saveProject(updatedProject);

      // Show celebration for section completion
      if (wasJustCompleted && updatedSection) {
        showToast(`${updatedSection.name} complete!`, 'success');
      }

      // Show celebration for project completion
      if (newProgress === 100) {
        setTimeout(() => {
          showToast('Project complete! Amazing work!', 'success');
        }, 500);
      }
    },
    [project, calculateProgress, saveProject, showToast]
  );

  // Edit instruction
  const handleEditSave = useCallback(
    (newInstruction: string) => {
      if (!project?.structuredPattern || !editModal.sectionId || !editModal.rowId) {
        setEditModal((prev) => ({ ...prev, visible: false }));
        return;
      }

      const updatedSections = project.structuredPattern.sections.map((section) => {
        if (section.id !== editModal.sectionId) return section;

        const updatedRows = section.rows.map((row) => {
          if (row.id !== editModal.rowId) return row;
          return { ...row, instruction: newInstruction };
        });

        return { ...section, rows: updatedRows };
      });

      const updatedProject: Project = {
        ...project,
        structuredPattern: {
          ...project.structuredPattern,
          sections: updatedSections,
        },
      };

      setProject(updatedProject);
      saveProject(updatedProject);
      setEditModal((prev) => ({ ...prev, visible: false }));
      showToast('Instruction updated', 'info');
    },
    [project, editModal, saveProject, showToast]
  );

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  // Render error state
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

  const progressPercentage = project.progressPercentage || 0;

  // Visuals Tab Content
  const renderVisualsTab = () => (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={styles.tabContentInner}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Images */}
      <View style={styles.imagesSection}>
        {/* AI Generated Plushie */}
        {project.generatedImageUri && (
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: project.generatedImageUri }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.imageLabel}>
              <Ionicons name="sparkles" size={14} color={Colors.primary} />
              <Text style={styles.imageLabelText}>AI Visualization</Text>
            </View>
          </View>
        )}

        {/* Original Photo - smaller comparison */}
        {project.originalImageUri && (
          <View style={styles.comparisonContainer}>
            <Image
              source={{ uri: project.originalImageUri }}
              style={styles.comparisonImage}
              resizeMode="cover"
            />
            <Text style={styles.comparisonLabel}>Original Photo</Text>
          </View>
        )}
      </View>

      {/* Project Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Project Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View
              style={[
                styles.statBadge,
                {
                  backgroundColor:
                    DIFFICULTY_COLORS[project.difficulty || 'intermediate'] + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.statBadgeText,
                  {
                    color: DIFFICULTY_COLORS[project.difficulty || 'intermediate'],
                  },
                ]}
              >
                {project.difficulty || 'Intermediate'}
              </Text>
            </View>
            <Text style={styles.statLabel}>Difficulty</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statBadge}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={styles.statBadgeText}>
                {project.structuredPattern?.estimatedTime || '3-5 hrs'}
              </Text>
            </View>
            <Text style={styles.statLabel}>Est. Time</Text>
          </View>

          <View style={styles.statItem}>
            <View
              style={[
                styles.statBadge,
                {
                  backgroundColor:
                    project.status === 'completed'
                      ? Colors.success + '20'
                      : Colors.primaryLight + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.statBadgeText,
                  {
                    color:
                      project.status === 'completed'
                        ? Colors.success
                        : Colors.primary,
                  },
                ]}
              >
                {project.status.replace('_', ' ')}
              </Text>
            </View>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>
      </View>

      {/* Materials Card */}
      <View style={styles.materialsCard}>
        <Text style={styles.cardTitle}>Materials</Text>

        {/* Yarns */}
        {project.yarns.length > 0 && (
          <View style={styles.materialsSection}>
            <View style={styles.materialsSectionHeader}>
              <Ionicons name="color-palette-outline" size={18} color={Colors.secondary} />
              <Text style={styles.materialsSectionTitle}>Yarn</Text>
            </View>
            {project.yarns.map((yarn) => (
              <View key={yarn.id} style={styles.materialItem}>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: getColorFromName(yarn.color || yarn.name) },
                  ]}
                />
                <Text style={styles.materialText}>
                  {yarn.color || yarn.name}
                  <Text style={styles.materialDetail}>
                    {' '}
                    ({yarn.weight}) - {yarn.quantity} {yarn.quantityUnit}
                  </Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Hooks */}
        {project.hooks.length > 0 && (
          <View style={styles.materialsSection}>
            <View style={styles.materialsSectionHeader}>
              <Ionicons name="git-commit-outline" size={18} color={Colors.accent} />
              <Text style={styles.materialsSectionTitle}>Hooks</Text>
            </View>
            {project.hooks.map((hook) => (
              <View key={hook.id} style={styles.materialItem}>
                <Text style={styles.materialText}>{hook.size}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Other Supplies */}
        {project.structuredPattern?.otherSupplies &&
          project.structuredPattern.otherSupplies.length > 0 && (
            <View style={styles.materialsSection}>
              <View style={styles.materialsSectionHeader}>
                <Ionicons name="bag-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.materialsSectionTitle}>Other Supplies</Text>
              </View>
              {project.structuredPattern.otherSupplies.map((supply, index) => (
                <View key={index} style={styles.materialItem}>
                  <Text style={styles.materialText}>{supply}</Text>
                </View>
              ))}
            </View>
          )}
      </View>

      {/* Description */}
      {project.description && (
        <View style={styles.descriptionCard}>
          <Text style={styles.cardTitle}>About This Pattern</Text>
          <Text style={styles.descriptionText}>{project.description}</Text>
        </View>
      )}

      {/* Abbreviations */}
      {project.structuredPattern?.abbreviations &&
        project.structuredPattern.abbreviations.length > 0 && (
          <View style={styles.abbreviationsCard}>
            <Text style={styles.cardTitle}>Abbreviations</Text>
            <View style={styles.abbreviationsGrid}>
              {project.structuredPattern.abbreviations.map((abbr, index) => (
                <View key={index} style={styles.abbreviationItem}>
                  <Text style={styles.abbreviationCode}>{abbr.abbr}</Text>
                  <Text style={styles.abbreviationMeaning}>{abbr.meaning}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
    </ScrollView>
  );

  // Pattern Tab Content
  const renderPatternTab = () => (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={[styles.tabContentInner, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Overall Progress */}
      <View style={styles.overallProgressCard}>
        <View style={styles.overallProgressHeader}>
          <Text style={styles.overallProgressTitle}>Overall Progress</Text>
          <Text style={styles.overallProgressPercent}>{progressPercentage}%</Text>
        </View>
        <View style={styles.overallProgressBarContainer}>
          <View
            style={[
              styles.overallProgressBar,
              { width: `${progressPercentage}%` },
            ]}
          />
        </View>
        {progressPercentage === 100 && (
          <View style={styles.completedBadge}>
            <Ionicons name="trophy" size={16} color={Colors.warning} />
            <Text style={styles.completedBadgeText}>Completed!</Text>
          </View>
        )}
      </View>

      {/* Instruction Hint */}
      <View style={styles.hintContainer}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textLight} />
        <Text style={styles.hintText}>
          Tap rows to mark complete. Long press to edit.
        </Text>
      </View>

      {/* Pattern Sections */}
      {project.structuredPattern?.sections.map((section) => (
        <View key={section.id} style={styles.sectionContainer}>
          <SectionHeader
            section={section}
            isExpanded={expandedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
          />
          {expandedSections.has(section.id) && (
            <View style={styles.sectionRows}>
              {section.rows.map((row, index) => (
                <PatternRowItem
                  key={row.id}
                  row={row}
                  index={index}
                  onToggle={() => toggleRow(section.id, row.id)}
                  onEdit={() =>
                    setEditModal({
                      visible: true,
                      sectionId: section.id,
                      rowId: row.id,
                      instruction: row.instruction,
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>
      ))}

      {/* Notes */}
      {project.aiSuggestions && project.aiSuggestions.length > 0 && (
        <View style={styles.notesCard}>
          <Text style={styles.cardTitle}>Tips & Notes</Text>
          {project.aiSuggestions.map((note, index) => (
            <View key={index} style={styles.noteItem}>
              <Ionicons name="bulb-outline" size={16} color={Colors.warning} />
              <Text style={styles.noteText}>{note}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      <Toast {...toast} />

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'visuals' && styles.tabActive]}
          onPress={() => setActiveTab('visuals')}
        >
          <Ionicons
            name="images-outline"
            size={20}
            color={activeTab === 'visuals' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'visuals' && styles.tabTextActive,
            ]}
          >
            Visuals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pattern' && styles.tabActive]}
          onPress={() => setActiveTab('pattern')}
        >
          <Ionicons
            name="document-text-outline"
            size={20}
            color={activeTab === 'pattern' ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'pattern' && styles.tabTextActive,
            ]}
          >
            Pattern
          </Text>
          {progressPercentage > 0 && progressPercentage < 100 && (
            <View style={styles.progressDot}>
              <Text style={styles.progressDotText}>{progressPercentage}%</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'visuals' ? renderVisualsTab() : renderPatternTab()}

      {/* Edit Modal */}
      <EditModal
        visible={editModal.visible}
        instruction={editModal.instruction}
        onSave={handleEditSave}
        onCancel={() => setEditModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

// Helper function to get a color from a color name
function getColorFromName(colorName: string): string {
  const colorMap: Record<string, string> = {
    pink: '#E8B4B8',
    blush: '#E8B4B8',
    cream: '#F5F2EC',
    white: '#FFFFFF',
    brown: '#8D6E63',
    black: '#3E2723',
    blue: '#64B5F6',
    green: '#81C784',
    sage: '#9CAF88',
    yellow: '#FFD54F',
    orange: '#FFB74D',
    red: '#E57373',
    purple: '#BA68C8',
    gray: '#9E9E9E',
    grey: '#9E9E9E',
    beige: '#D7CCC8',
    tan: '#BCAAA4',
    peach: '#FFCCBC',
    coral: '#FF8A65',
    mint: '#A5D6A7',
    lavender: '#CE93D8',
    navy: '#5C6BC0',
    teal: '#4DB6AC',
  };

  const lowerName = colorName.toLowerCase();
  for (const [key, value] of Object.entries(colorMap)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  return Colors.primaryLight;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: Spacing.sm,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  progressDot: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
    marginLeft: Spacing.xs,
  },
  progressDotText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },

  // Tab Content
  tabContent: {
    flex: 1,
  },
  tabContentInner: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Toast
  toast: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    zIndex: 1000,
    ...Shadow.medium,
  },
  toastSuccess: {
    backgroundColor: Colors.success,
  },
  toastInfo: {
    backgroundColor: Colors.primary,
  },
  toastText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textOnPrimary,
  },

  // Images Section
  imagesSection: {
    marginBottom: Spacing.lg,
  },
  heroImageContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    ...Shadow.medium,
  },
  heroImage: {
    width: '100%',
    height: SCREEN_WIDTH - Spacing.lg * 2,
    backgroundColor: Colors.backgroundSecondary,
  },
  imageLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  imageLabelText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },
  comparisonContainer: {
    marginTop: Spacing.md,
    alignItems: 'flex-start',
  },
  comparisonImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  comparisonLabel: {
    marginTop: Spacing.xs,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  // Stats Card
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.small,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryLight + '20',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  statBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  // Materials Card
  materialsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.small,
  },
  materialsSection: {
    marginBottom: Spacing.md,
  },
  materialsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  materialsSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.lg + Spacing.sm,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  materialText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  materialDetail: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },

  // Description Card
  descriptionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.small,
  },
  descriptionText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },

  // Abbreviations Card
  abbreviationsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.small,
  },
  abbreviationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  abbreviationItem: {
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  abbreviationCode: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  abbreviationMeaning: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // Overall Progress
  overallProgressCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.small,
  },
  overallProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  overallProgressTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  overallProgressPercent: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  overallProgressBarContainer: {
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  overallProgressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.warning + '20',
    borderRadius: BorderRadius.sm,
  },
  completedBadgeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.warning,
  },

  // Hint
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  hintText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    fontStyle: 'italic',
  },

  // Section
  sectionContainer: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sectionHeaderComplete: {
    backgroundColor: Colors.success + '10',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginLeft: Spacing.xs,
  },
  sectionTitleComplete: {
    color: Colors.success,
  },
  sectionCheckmark: {
    marginLeft: Spacing.xs,
  },
  sectionProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBarContainer: {
    width: 60,
    height: 6,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    minWidth: 32,
    textAlign: 'right',
  },
  sectionRows: {
    paddingVertical: Spacing.xs,
  },

  // Pattern Row
  patternRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  patternRowCompleted: {
    backgroundColor: Colors.success + '08',
  },
  rowCheckbox: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowNumber: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    fontWeight: FontWeight.medium,
  },
  rowInstruction: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  rowInstructionCompleted: {
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  editButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },

  // Notes Card
  notesCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    ...Shadow.small,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  noteText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...Shadow.large,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  modalInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  modalButtonCancel: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  modalButtonCancelText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  modalButtonSave: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  modalButtonSaveText: {
    fontSize: FontSize.md,
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.semibold,
  },
});
