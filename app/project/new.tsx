/**
 * New Project Screen
 * 3-stage AI transformation flow: Input → Processing → Preview & Save
 * Neo-Brutalist "Retro Pop" design
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
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { StrokedText } from '@/components';
import { Colors, Spacing, FontSize, Fonts, BorderRadius, NeoBrutalist } from '@/constants/theme';
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
          // Haptic feedback for each stage completion
          if (newStage !== 'idle') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
        onError: (err, failedStage) => {
          console.error(`Error at stage ${failedStage}:`, err);
          setError(err.message);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      });

      // Success haptic when pattern is ready
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        {/* Header with StrokedText */}
        <View style={styles.headerSection}>
          <StrokedText fontSize={FontSize.hero} lineHeight={52} textAlign="center">
            Transform
          </StrokedText>
          <StrokedText fontSize={FontSize.hero} lineHeight={52} textAlign="center">
            your photo
          </StrokedText>
          <Text style={styles.stageSubtitle}>
            Pick any photo and watch it become a cute crochet pattern!
          </Text>
        </View>

        {/* Image Preview Area - Dashed border Neo-Brutalist */}
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
              <Text style={styles.placeholderEmoji}>📷</Text>
              <Text style={styles.placeholderText}>tap to select photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Image Source Buttons - Neo-Brutalist style */}
        <View style={styles.sourceButtons}>
          <TouchableOpacity
            style={styles.sourceButton}
            onPress={pickImageFromGallery}
            activeOpacity={0.8}
          >
            <Text style={styles.sourceButtonEmoji}>🖼️</Text>
            <Text style={styles.sourceButtonText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sourceButton}
            onPress={takePhoto}
            activeOpacity={0.8}
          >
            <Text style={styles.sourceButtonEmoji}>📸</Text>
            <Text style={styles.sourceButtonText}>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Button - Neo-Brutalist with solid border */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          !selectedImage && styles.primaryButtonDisabled,
        ]}
        onPress={startGeneration}
        disabled={!selectedImage}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonEmoji}>✨</Text>
        <Text
          style={[
            styles.primaryButtonText,
            !selectedImage && styles.primaryButtonTextDisabled,
          ]}
        >
          create magic
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
          {/* Animated Magic Wand - Neo-Brutalist */}
          <Animated.View
            style={[
              styles.yarnBallContainer,
              {
                transform: [{ rotate: spin }, { scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.yarnBall}>
              <Text style={styles.processingEmoji}>🪄</Text>
            </View>
            {/* Decorative dots */}
            <View style={[styles.orbitDot, styles.orbitDot1]} />
            <View style={[styles.orbitDot, styles.orbitDot2]} />
            <View style={[styles.orbitDot, styles.orbitDot3]} />
          </Animated.View>

          {/* Status Text with StrokedText */}
          <StrokedText fontSize={FontSize.xxl} lineHeight={40} textAlign="center">
            Creating Magic
          </StrokedText>
          <Text style={styles.processingStatus}>{stageInfo.message}</Text>

          {/* Progress Bar - Neo-Brutalist */}
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

          {/* Tip Card - Neo-Brutalist */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipEmoji}>💡</Text>
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
          {/* Success Header with StrokedText */}
          <View style={styles.successHeader}>
            <Text style={styles.successEmoji}>✅</Text>
            <StrokedText fontSize={FontSize.xxl} lineHeight={36} textAlign="center">
              Pattern Ready!
            </StrokedText>
          </View>

          {/* Image Comparison - Neo-Brutalist */}
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Your Photo</Text>
              <View style={styles.comparisonImageWrapper}>
                <Image
                  source={{ uri: originalImageUri }}
                  style={styles.comparisonImage}
                  contentFit="cover"
                />
              </View>
            </View>

            <View style={styles.transformArrow}>
              <Text style={styles.arrowEmoji}>➡️</Text>
            </View>

            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Plushie Vision</Text>
              <View style={styles.comparisonImageWrapper}>
                <Image
                  source={{ uri: generatedImageUrl }}
                  style={styles.comparisonImage}
                  contentFit="cover"
                />
              </View>
            </View>
          </View>

          {/* Project Summary - Neo-Brutalist Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.projectName}>{pattern.projectName}</Text>
            <Text style={styles.projectDescription}>{pattern.description}</Text>

            <View style={styles.summaryDetails}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryEmoji}>📊</Text>
                <Text style={styles.summaryLabel}>Difficulty</Text>
                <Text style={styles.summaryValue}>{pattern.difficulty}</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryEmoji}>⏱️</Text>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>{pattern.estimatedTime}</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryEmoji}>🎨</Text>
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

        {/* Action Buttons - Neo-Brutalist */}
        <View style={styles.previewActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={resetFlow}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonEmoji}>🔄</Text>
            <Text style={styles.secondaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={saveProject}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonEmoji}>💖</Text>
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
 * Helper to convert color names to hex codes for display - Pastel Pop palette inspired
 */
function getColorCode(colorName: string): string {
  const colorMap: Record<string, string> = {
    'pastel pink': '#F4D3DB',
    pink: '#EBA9B9',
    blush: '#D48295',
    cream: '#F1F2ED',
    white: '#FFFFFF',
    brown: '#B65C2C',
    'soft brown': '#D57E4F',
    beige: '#E8E9E4',
    tan: '#D57E4F',
    gray: '#9E9E9E',
    grey: '#9E9E9E',
    black: '#3E1F12',
    blue: '#64B5F6',
    'soft blue': '#ADD8E6',
    green: '#81C784',
    'sage green': '#A5D6A7',
    yellow: '#F2E08E',
    orange: '#D57E4F',
    red: '#E57373',
    purple: '#A395EC',
    lavender: '#C5BBF5',
    terracotta: '#B65C2C',
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

  // Stage 1: Input - Neo-Brutalist
  inputContent: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  stageSubtitle: {
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  imagePickerArea: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: NeoBrutalist.borderColor,
    borderStyle: 'dashed',
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
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  placeholderText: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.heavy,
    color: Colors.text,
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
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
    gap: Spacing.sm,
  },
  sourceButtonEmoji: {
    fontSize: 20,
  },
  sourceButtonText: {
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
    color: Colors.text,
  },

  // Stage 2: Processing - Neo-Brutalist
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
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
  },
  processingEmoji: {
    fontSize: 48,
  },
  orbitDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: NeoBrutalist.borderColor,
  },
  orbitDot1: {
    backgroundColor: Colors.primary,
    top: 10,
    right: 20,
  },
  orbitDot2: {
    backgroundColor: Colors.background,
    bottom: 15,
    left: 15,
  },
  orbitDot3: {
    backgroundColor: Colors.card,
    top: 50,
    left: 5,
  },
  processingStatus: {
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
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
    height: 12,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    marginLeft: Spacing.md,
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    minWidth: 45,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
    maxWidth: '95%',
  },
  tipEmoji: {
    fontSize: 18,
  },
  tipText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    flex: 1,
  },

  // Stage 3: Preview - Neo-Brutalist
  previewScroll: {
    flex: 1,
  },
  previewScrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  successHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
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
    fontFamily: Fonts.heavy,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonImageWrapper: {
    borderRadius: BorderRadius.md,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
    overflow: 'hidden',
  },
  comparisonImage: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - 60) / 2,
    aspectRatio: 1,
    backgroundColor: Colors.card,
  },
  transformArrow: {
    width: 40,
    alignItems: 'center',
  },
  arrowEmoji: {
    fontSize: 24,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
  },
  projectName: {
    fontSize: FontSize.xl,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  projectDescription: {
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
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
    borderTopColor: Colors.stroke,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryEmoji: {
    fontSize: 20,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  summaryValue: {
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
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
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
  },
  previewActions: {
    flexDirection: 'row',
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },

  // Buttons - Neo-Brutalist
  buttonEmoji: {
    fontSize: 18,
  },
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
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.card,
  },
  primaryButtonText: {
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
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
    backgroundColor: Colors.card,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  secondaryButtonText: {
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
    color: Colors.text,
  },
});
