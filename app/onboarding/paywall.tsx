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
                  <Text style={styles.cardDuration}>{option.duration}</Text>
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
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
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
    marginVertical: Spacing.sm,
  },
  subscriptionContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  cardWrapper: {
    flex: 1,
    position: 'relative',
    marginBottom: 20, // Space for overlapping circle
  },
  subscriptionCard: {
    backgroundColor: Colors.background,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: Colors.stroke,
    borderRadius: NeoBrutalist.borderRadius,
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    minHeight: 90,
  },
  cardDuration: {
    fontSize: FontSize.xl,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: FontSize.md,
    fontFamily: Fonts.light,
    color: Colors.text,
  },
  radioCircle: {
    position: 'absolute',
    bottom: -20,
    left: '50%',
    marginLeft: -20,
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
  },
  continueButtonText: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.heavy,
    color: Colors.text,
  },
});
