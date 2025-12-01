/**
 * StitchTutorialModal
 * A Neo-Brutalist styled modal displaying detailed stitch tutorials
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StrokedText } from './StrokedText';
import {
  Colors,
  Spacing,
  FontSize,
  Fonts,
  BorderRadius,
  NeoBrutalist,
} from '@/constants/theme';

// Detailed stitch guide data
export interface StitchTutorial {
  abbr: string;
  name: string;
  meaning: string;
  instructions: string[];
  image: string | null; // Placeholder for future image support
}

export const DETAILED_STITCH_GUIDE: StitchTutorial[] = [
  {
    abbr: 'sc',
    name: 'Single Crochet',
    meaning: 'single crochet',
    instructions: [
      'Insert hook into the stitch',
      'Yarn over and pull through stitch (2 loops on hook)',
      'Yarn over and pull through both loops',
    ],
    image: null,
  },
  {
    abbr: 'inc',
    name: 'Increase',
    meaning: 'increase (2 sc in same stitch)',
    instructions: [
      'Work one single crochet into the stitch',
      'Work another single crochet into the same stitch',
      'You now have 2 stitches where there was 1',
    ],
    image: null,
  },
  {
    abbr: 'dec',
    name: 'Invisible Decrease',
    meaning: 'invisible decrease',
    instructions: [
      'Insert hook through front loop only of next stitch',
      'Insert hook through front loop only of following stitch',
      'Yarn over and pull through both front loops (3 loops on hook)',
      'Yarn over and pull through all 3 loops',
    ],
    image: null,
  },
  {
    abbr: 'ch',
    name: 'Chain',
    meaning: 'chain',
    instructions: [
      'Start with a slip knot on your hook',
      'Yarn over (wrap yarn around hook from back to front)',
      'Pull yarn through the loop on your hook',
      'Repeat for desired number of chains',
    ],
    image: null,
  },
  {
    abbr: 'sl st',
    name: 'Slip Stitch',
    meaning: 'slip stitch',
    instructions: [
      'Insert hook into the stitch',
      'Yarn over and pull through both the stitch AND the loop on hook in one motion',
      'Used for joining rounds or moving yarn without adding height',
    ],
    image: null,
  },
  {
    abbr: 'MR',
    name: 'Magic Ring',
    meaning: 'magic ring',
    instructions: [
      'Wrap yarn around your finger twice to form a loop',
      'Insert hook through loop, yarn over and pull up a loop',
      'Chain 1 to secure',
      'Work your stitches into the ring',
      'Pull the tail end to close the ring tightly',
    ],
    image: null,
  },
  {
    abbr: 'FO',
    name: 'Fasten Off',
    meaning: 'fasten off',
    instructions: [
      'Cut yarn leaving a 6-inch tail',
      'Yarn over and pull tail completely through the last loop',
      'Pull tight to secure',
      'Weave in end with a yarn needle',
    ],
    image: null,
  },
  {
    abbr: 'hdc',
    name: 'Half Double Crochet',
    meaning: 'half double crochet',
    instructions: [
      'Yarn over before inserting hook',
      'Insert hook into stitch',
      'Yarn over and pull through stitch (3 loops on hook)',
      'Yarn over and pull through all 3 loops',
    ],
    image: null,
  },
  {
    abbr: 'dc',
    name: 'Double Crochet',
    meaning: 'double crochet',
    instructions: [
      'Yarn over before inserting hook',
      'Insert hook into stitch',
      'Yarn over and pull through stitch (3 loops on hook)',
      'Yarn over and pull through 2 loops (2 loops remain)',
      'Yarn over and pull through last 2 loops',
    ],
    image: null,
  },
  {
    abbr: 'BLO',
    name: 'Back Loop Only',
    meaning: 'back loop only',
    instructions: [
      'Identify the two loops at the top of the stitch',
      'Insert hook under only the back loop (away from you)',
      'Complete your stitch as normal',
      'Creates a ribbed texture',
    ],
    image: null,
  },
  {
    abbr: 'FLO',
    name: 'Front Loop Only',
    meaning: 'front loop only',
    instructions: [
      'Identify the two loops at the top of the stitch',
      'Insert hook under only the front loop (closest to you)',
      'Complete your stitch as normal',
      'Creates a ridged texture',
    ],
    image: null,
  },
];

interface StitchTutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

export const StitchTutorialModal: React.FC<StitchTutorialModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <StrokedText fontSize={FontSize.xxl} lineHeight={36} textAlign="center">
              Stitch Library
            </StrokedText>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Stitch List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {DETAILED_STITCH_GUIDE.map((stitch, index) => (
            <View key={index} style={styles.stitchCard}>
              {/* Stitch Header */}
              <View style={styles.stitchHeader}>
                <View style={styles.abbrBadge}>
                  <Text style={styles.abbrText}>{stitch.abbr}</Text>
                </View>
                <StrokedText
                  fontSize={FontSize.lg}
                  lineHeight={28}
                  textAlign="left"
                >
                  {stitch.name}
                </StrokedText>
              </View>

              {/* Image Placeholder */}
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderEmoji}>🧶</Text>
                <Text style={styles.imagePlaceholderText}>
                  Visual coming soon
                </Text>
              </View>

              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Steps:</Text>
                {stitch.instructions.map((step, stepIndex) => (
                  <View key={stepIndex} style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{stepIndex + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: NeoBrutalist.borderWidth,
    borderBottomColor: NeoBrutalist.borderColor,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: Spacing.lg,
    width: 40,
    height: 40,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.heavy,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  stitchCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
    padding: Spacing.lg,
  },
  stitchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  abbrBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: NeoBrutalist.borderColor,
    minWidth: 50,
    alignItems: 'center',
  },
  abbrText: {
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
    color: Colors.textOnPrimary,
  },
  imagePlaceholder: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: NeoBrutalist.borderColor,
    borderStyle: 'dashed',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  imagePlaceholderEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  imagePlaceholderText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.light,
    color: Colors.textSecondary,
  },
  instructionsContainer: {
    gap: Spacing.sm,
  },
  instructionsTitle: {
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: NeoBrutalist.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.heavy,
    color: Colors.textOnPrimary,
  },
  stepText: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
    color: Colors.text,
    lineHeight: 24,
  },
});

export default StitchTutorialModal;
