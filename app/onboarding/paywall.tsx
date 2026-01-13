/**
 * Onboarding Paywall Screen
 * Premium subscription options with split background design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
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
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Section: Blurred Image Background */}
        <View style={styles.topSection}>
          <ImageBackground
            source={require('@/assets/images/paywall-crochet-toys.png')}
            style={styles.imageBackground}
            resizeMode="cover"
          >
            <BlurView intensity={40} style={styles.blurOverlay} tint="light">
              <View style={styles.titleContainer}>
                <StrokedText
                  fontSize={44}
                  lineHeight={52}
                  color={Colors.background}
                  strokeColor={Colors.stroke}
                >
                  Design your{'\n'}journey
                </StrokedText>
              </View>
            </BlurView>
          </ImageBackground>
        </View>

        {/* Bottom Section: Pink Background with Content */}
        <View style={styles.bottomSection}>
          {/* Features List */}
          <View style={styles.featuresContainer}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons
                  name="checkmark"
                  size={28}
                  color={Colors.text}
                  style={styles.checkIcon}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Subscription Cards */}
          <View style={styles.subscriptionContainer}>
            {SUBSCRIPTION_OPTIONS.map((option) => {
              const isSelected = selectedPlan === option.id;
              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.subscriptionCard,
                    isSelected && styles.subscriptionCardSelected,
                  ]}
                  onPress={() => handleSelectPlan(option.id)}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardDuration}>{option.duration}</Text>
                      <Text style={styles.cardPrice}>{option.price}</Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={24}
                          color={Colors.text}
                        />
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              { marginBottom: insets.bottom + Spacing.xl },
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paywallPink,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    height: 280,
    width: '100%',
  },
  imageBackground: {
    flex: 1,
    width: '100%',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    paddingHorizontal: Spacing.lg,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: Colors.paywallPink,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  featuresContainer: {
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  checkIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: FontSize.lg,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    lineHeight: 24,
  },
  subscriptionContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  subscriptionCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: Colors.stroke,
    borderRadius: NeoBrutalist.borderRadius,
    padding: Spacing.lg,
    minHeight: 100,
  },
  subscriptionCardSelected: {
    borderWidth: 3,
    borderColor: Colors.stroke,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTextContainer: {
    marginBottom: Spacing.sm,
  },
  cardDuration: {
    fontSize: FontSize.xl,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.light,
    color: Colors.text,
  },
  radioCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: Colors.stroke,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
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
  },
  continueButtonText: {
    fontSize: FontSize.xl,
    fontFamily: Fonts.heavy,
    color: Colors.text,
  },
});
