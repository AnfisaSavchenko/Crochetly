/**
 * Onboarding Paywall Screen
 * Single-screen premium subscription offer matching reference design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { StrokedText } from '@/components';
import { Colors, Spacing, FontSize, Fonts, NeoBrutalist } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

type SubscriptionOption = '7days' | '1month';

interface SubscriptionCard {
  id: SubscriptionOption;
  duration: string;
  price: string;
}

const SUBSCRIPTION_OPTIONS: SubscriptionCard[] = [
  {
    id: '7days',
    duration: '7 days',
    price: '$7',
  },
  {
    id: '1month',
    duration: '1 month',
    price: '$15',
  },
];

const FEATURES = [
  'Turn any photo into a pattern',
  'Get step-by-step instructions, stitch by stitch',
  "Create patterns you won't find anywhere else",
];

// Red curved arrow pointing up
const CurvedArrow = () => (
  <Svg width="60" height="50" viewBox="0 0 60 50" style={{ marginLeft: 4 }}>
    <Path
      d="M 10 45 Q 25 15, 40 10 L 35 5 M 40 10 L 45 15"
      stroke="#FF0000"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionOption>('7days');

  const handleSelectPlan = (planId: SubscriptionOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: Handle subscription logic here
    router.push('/onboarding/auth');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.md : Spacing.lg }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={20} color={Colors.text} />
        <Text style={styles.backButtonText}>Camera</Text>
      </TouchableOpacity>

      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image
          source={require('@/assets/images/paywall.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <StrokedText
          fontSize={40}
          lineHeight={48}
          color={Colors.background}
          strokeColor={Colors.stroke}
        >
          Design your{'\n'}journey
        </StrokedText>
      </View>

      {/* Features List */}
      <View style={styles.featuresContainer}>
        {FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons
              name="checkmark"
              size={26}
              color={Colors.text}
              style={styles.checkIcon}
            />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Subscription Cards with overlapping circles */}
      <View style={styles.subscriptionWrapper}>
        <View style={styles.subscriptionContainer}>
          {SUBSCRIPTION_OPTIONS.map((option) => {
            const isSelected = selectedPlan === option.id;
            return (
              <View key={option.id} style={styles.cardWrapper}>
                <Pressable
                  style={styles.subscriptionCard}
                  onPress={() => handleSelectPlan(option.id)}
                >
                  <View style={styles.cardContent}>
                    <Text style={styles.cardDuration}>{option.duration}</Text>
                    <CurvedArrow />
                  </View>
                  <Text style={styles.cardPrice}>{option.price}</Text>
                </Pressable>
                {/* Overlapping circle positioned at bottom center */}
                <Pressable
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                  onPress={() => handleSelectPlan(option.id)}
                >
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={22}
                      color={Colors.text}
                    />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paywallPink,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  backButtonText: {
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    marginLeft: 2,
  },
  heroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 240,
    height: 240,
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  featuresContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    width: '100%',
  },
  checkIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    lineHeight: 22,
  },
  subscriptionWrapper: {
    width: '100%',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  subscriptionContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  cardWrapper: {
    flex: 1,
    position: 'relative',
    marginBottom: 16, // Reduced space for tighter layout
  },
  subscriptionCard: {
    backgroundColor: Colors.background,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: Colors.stroke,
    borderRadius: NeoBrutalist.borderRadius,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg + 10, // Extra padding to clear the overlapping circle
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardDuration: {
    fontSize: 28,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    lineHeight: 32,
  },
  cardPrice: {
    fontSize: FontSize.xl,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    lineHeight: 28,
    marginTop: -4,
  },
  radioCircle: {
    position: 'absolute',
    bottom: -20,
    left: '50%',
    transform: [{ translateX: -20 }], // Perfect centering for 40px circle
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: Colors.stroke,
    backgroundColor: Colors.paywallPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    backgroundColor: Colors.primary,
  },
  continueButton: {
    backgroundColor: Colors.background,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: Colors.stroke,
    borderRadius: 999,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: Spacing.xs,
  },
  continueButtonText: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.heavy,
    color: Colors.text,
  },
});
