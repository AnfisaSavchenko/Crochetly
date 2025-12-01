/**
 * New Project Screen
 * 3-stage AI transformation flow: Input → Processing → Preview & Save
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/theme';
import { generateProjectFromImage, convertToProjectData } from '@/services/ai';
import { ProjectStorage } from '@/services/storage';
import { ProcessingStage, STAGE_INFO, AIGenerationResult } from '@/types/ai';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CreationStage = 'input' | 'processing' | 'preview';

export default function NewProjectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Stage management
  const [stage, setStage] = useState<CreationStage>('input');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [generationResult, setGenerationResult] = useState<AIGenerationResult | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_error, setError] = useState<string | null>(null);

  // Animation refs
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Spinning animation for processing
  useEffect(() => {
    if (stage === 'processing') {
      const spin = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spin.start();

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => {
        spin.stop();
        pulse.stop();
      };
    }
  }, [stage, spinAnim, pulseAnim]);

  // Fade in animation for preview
  useEffect(() => {
    if (stage === 'preview') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [stage, fadeAnim]);

  // Image picker handlers
  const pickImageFromGallery = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select an image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        // Use base64 data URI for the AI service
        const imageUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setSelectedImage(imageUri);
        setError(null);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const imageUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setSelectedImage(imageUri);
        setError(null);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  }, []);

  // Start the AI generation process
  const startGeneration = useCallback(async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setStage('processing');
    setError(null);
    setProcessingStage('idle');

    try {
      const result = await generateProjectFromImage(selectedImage, {
        onStageChange: (newStage) => {
          setProcessingStage(newStage);
        },
        onError: (err, failedStage) => {
          console.error(`Error at stage ${failedStage}:`, err);
          setError(err.message);
        },
      });

      setGenerationResult(result);
      setStage('preview');
    } catch (err) {
      console.error('Generation failed:', err);
      setError((err as Error).message || 'Generation failed. Please try again.');
      setStage('input');
      Alert.alert(
        'Generation Failed',
        'Something went wrong during the AI generation. Please try again with a different image.',
        [{ text: 'OK' }]
      );
    }
  }, [selectedImage]);

  // Save project and navigate
  const saveProject = useCallback(async () => {
    if (!generationResult) return;

    try {
      const projectData = convertToProjectData(generationResult);
      const project = await ProjectStorage.createProject(projectData);
      router.replace(`/project/${project.id}`);
    } catch (err) {
      console.error('Error saving project:', err);
      Alert.alert('Error', 'Failed to save project. Please try again.');
    }
  }, [generationResult, router]);

  // Reset to try again
  const resetFlow = useCallback(() => {
    setStage('input');
    setSelectedImage(null);
    setProcessingStage('idle');
    setGenerationResult(null);
    setError(null);
  }, []);

  // Render Stage 1: Input
  const renderInputStage = () => (
    <View style={styles.stageContainer}>
      <View style={styles.inputContent}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.stageTitle}>Transform Your Photo</Text>
          <Text style={styles.stageSubtitle}>
            Pick any photo and watch it become a cute crochet pattern!
          </Text>
        </View>

        {/* Image Preview Area */}
        <TouchableOpacity
          style={styles.imagePickerArea}
          onPress={pickImageFromGallery}
          activeOpacity={0.8}
        >
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.placeholderContent}>
              <View style={styles.placeholderIcon}>
                <Ionicons name="image-outline" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.placeholderText}>Tap to select an image</Text>
              <Text style={styles.placeholderHint}>
                Choose a photo of anything you want to turn into a plushie
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Image Source Buttons */}
        <View style={styles.sourceButtons}>
          <TouchableOpacity
            style={styles.sourceButton}
            onPress={pickImageFromGallery}
            activeOpacity={0.8}
          >
            <Ionicons name="images-outline" size={24} color={Colors.primary} />
            <Text style={styles.sourceButtonText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sourceButton}
            onPress={takePhoto}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-outline" size={24} color={Colors.primary} />
            <Text style={styles.sourceButtonText}>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          !selectedImage && styles.primaryButtonDisabled,
        ]}
        onPress={startGeneration}
        disabled={!selectedImage}
        activeOpacity={0.8}
      >
        <Ionicons
          name="sparkles"
          size={20}
          color={selectedImage ? Colors.textOnPrimary : Colors.textLight}
        />
        <Text
          style={[
            styles.primaryButtonText,
            !selectedImage && styles.primaryButtonTextDisabled,
          ]}
        >
          Create Magic
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render Stage 2: Processing
  const renderProcessingStage = () => {
    const stageInfo = STAGE_INFO[processingStage];
    const spin = spinAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.stageContainer}>
        <View style={styles.processingContent}>
          {/* Animated Yarn Ball */}
          <Animated.View
            style={[
              styles.yarnBallContainer,
              {
                transform: [{ rotate: spin }, { scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.yarnBall}>
              <Ionicons name="color-wand" size={48} color={Colors.primary} />
            </View>
            {/* Decorative dots */}
            <View style={[styles.orbitDot, styles.orbitDot1]} />
            <View style={[styles.orbitDot, styles.orbitDot2]} />
            <View style={[styles.orbitDot, styles.orbitDot3]} />
          </Animated.View>

          {/* Status Text */}
          <Text style={styles.processingTitle}>Creating Your Pattern</Text>
          <Text style={styles.processingStatus}>{stageInfo.message}</Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${stageInfo.progress}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{stageInfo.progress}%</Text>
          </View>

          {/* Tip */}
          <View style={styles.tipContainer}>
            <Ionicons name="bulb-outline" size={16} color={Colors.secondary} />
            <Text style={styles.tipText}>
              This usually takes 30-60 seconds. The AI is crafting something special!
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render Stage 3: Preview
  const renderPreviewStage = () => {
    if (!generationResult) return null;

    const { analysis, generatedImageUrl, originalImageUri, pattern } = generationResult;

    return (
      <Animated.View style={[styles.stageContainer, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.previewScroll}
          contentContainerStyle={styles.previewScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Header */}
          <View style={styles.successHeader}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>Pattern Ready!</Text>
          </View>

          {/* Image Comparison */}
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Your Photo</Text>
              <Image
                source={{ uri: originalImageUri }}
                style={styles.comparisonImage}
                contentFit="cover"
              />
            </View>

            <View style={styles.transformArrow}>
              <Ionicons name="arrow-forward" size={24} color={Colors.primary} />
            </View>

            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Plushie Vision</Text>
              <Image
                source={{ uri: generatedImageUrl }}
                style={styles.comparisonImage}
                contentFit="cover"
              />
            </View>
          </View>

          {/* Project Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.projectName}>{pattern.projectName}</Text>
            <Text style={styles.projectDescription}>{pattern.description}</Text>

            <View style={styles.summaryDetails}>
              <View style={styles.summaryItem}>
                <Ionicons name="speedometer-outline" size={20} color={Colors.accent} />
                <Text style={styles.summaryLabel}>Difficulty</Text>
                <Text style={styles.summaryValue}>{pattern.difficulty}</Text>
              </View>

              <View style={styles.summaryItem}>
                <Ionicons name="time-outline" size={20} color={Colors.accent} />
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>{pattern.estimatedTime}</Text>
              </View>

              <View style={styles.summaryItem}>
                <Ionicons name="color-palette-outline" size={20} color={Colors.accent} />
                <Text style={styles.summaryLabel}>Colors</Text>
                <Text style={styles.summaryValue}>
                  {pattern.materials.yarns.length}
                </Text>
              </View>
            </View>

            {/* Color Preview */}
            <View style={styles.colorPreview}>
              {analysis.colors.slice(0, 5).map((color, index) => (
                <View
                  key={index}
                  style={[styles.colorDot, { backgroundColor: getColorCode(color) }]}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.previewActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={resetFlow}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={saveProject}
            activeOpacity={0.8}
          >
            <Ionicons name="heart" size={20} color={Colors.textOnPrimary} />
            <Text style={styles.primaryButtonText}>Start Project</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {stage === 'input' && renderInputStage()}
      {stage === 'processing' && renderProcessingStage()}
      {stage === 'preview' && renderPreviewStage()}
    </View>
  );
}

/**
 * Helper to convert color names to hex codes for display
 */
function getColorCode(colorName: string): string {
  const colorMap: Record<string, string> = {
    'pastel pink': '#FFD1DC',
    pink: '#FFC0CB',
    blush: '#DE5D83',
    cream: '#FFFDD0',
    white: '#FFFFFF',
    brown: '#8B4513',
    'soft brown': '#A67B5B',
    beige: '#F5F5DC',
    tan: '#D2B48C',
    gray: '#808080',
    grey: '#808080',
    black: '#333333',
    blue: '#6495ED',
    'soft blue': '#ADD8E6',
    green: '#90EE90',
    'sage green': '#9CAF88',
    yellow: '#FFE4B5',
    orange: '#FFA500',
    red: '#FF6B6B',
    purple: '#DDA0DD',
    lavender: '#E6E6FA',
  };

  const lowerColor = colorName.toLowerCase();
  for (const [key, value] of Object.entries(colorMap)) {
    if (lowerColor.includes(key)) {
      return value;
    }
  }
  return Colors.primaryLight; // Default color
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stageContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  // Stage 1: Input
  inputContent: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  stageTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  stageSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  imagePickerArea: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    ...Shadow.small,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  placeholderText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  placeholderHint: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    textAlign: 'center',
  },
  sourceButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  sourceButtonText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },

  // Stage 2: Processing
  processingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  yarnBallContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  yarnBall: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primaryLight,
    ...Shadow.medium,
  },
  orbitDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  orbitDot1: {
    backgroundColor: Colors.secondary,
    top: 10,
    right: 20,
  },
  orbitDot2: {
    backgroundColor: Colors.primary,
    bottom: 15,
    left: 15,
  },
  orbitDot3: {
    backgroundColor: Colors.secondaryLight,
    top: 50,
    left: 5,
  },
  processingTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  processingStatus: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  progressBarContainer: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    marginLeft: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    minWidth: 40,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    maxWidth: '90%',
  },
  tipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    flex: 1,
  },

  // Stage 3: Preview
  previewScroll: {
    flex: 1,
  },
  previewScrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successIcon: {
    marginRight: Spacing.sm,
  },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonImage: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - 60) / 2,
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundSecondary,
  },
  transformArrow: {
    width: 40,
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.small,
  },
  projectName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  projectDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  summaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  summaryValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  colorPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.surface,
    ...Shadow.small,
  },
  previewActions: {
    flexDirection: 'row',
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },

  // Buttons
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadow.medium,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.borderLight,
  },
  primaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textOnPrimary,
  },
  primaryButtonTextDisabled: {
    color: Colors.textLight,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  secondaryButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
});
