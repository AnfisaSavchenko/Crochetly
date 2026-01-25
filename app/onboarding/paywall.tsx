/**
 * Onboarding Paywall Screen
 * Premium subscription offer with 3-day trial periods
 * Integrates with RevenueCat for purchase flow and App Store compliance
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { StrokedText } from '@/components';
import { Colors, Spacing, FontSize, Fonts, NeoBrutalist } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingStorage } from '@/services/onboardingStorage';
import { PurchasesPackage } from 'react-native-purchases';
import {
  initializeRevenueCat,
  getAvailablePackages,
  makePurchase,
  restorePurchases,
  isRevenueCatInitialized,
} from '@/services/revenuecatService';

type SubscriptionOption = 'weekly' | 'monthly';

interface SubscriptionCardData {
  id: SubscriptionOption;
  trialText: string;
  pricingText: string;
  packageType?: string; // RevenueCat package type identifier
}

// Default subscription options (used when RevenueCat is not available)
const DEFAULT_SUBSCRIPTION_OPTIONS: SubscriptionCardData[] = [
  {
    id: 'weekly',
    trialText: '3-day free trial',
    pricingText: 'then $7 per week',
    packageType: 'WEEKLY',
  },
  {
    id: 'monthly',
    trialText: '3-day free trial',
    pricingText: 'then $15 per month',
    packageType: 'MONTHLY',
  },
];

const FEATURES = [
  'Turn any photo into a pattern',
  'Get step-by-step instructions, stitch by stitch',
  "Create patterns you won't find anywhere else",
];

// Legal Document URL - Both Terms of Use and Privacy Policy point to the same document
const LEGAL_DOC_URL = 'https://docs.google.com/document/d/1FwpnQvbmuaf80OxKjlCMwjQCqT13vVJZ6tOeQ-4Q2uk/edit?usp=sharing';
const TERMS_URL = LEGAL_DOC_URL;
const PRIVACY_URL = LEGAL_DOC_URL;

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionOption>('weekly');
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [subscriptionOptions, setSubscriptionOptions] = useState<SubscriptionCardData[]>(DEFAULT_SUBSCRIPTION_OPTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize RevenueCat
      await initializeRevenueCat();

      // Check if RevenueCat was initialized successfully
      if (!isRevenueCatInitialized()) {
        console.log('⚠️ RevenueCat not initialized - using default options');
        setSubscriptionOptions(DEFAULT_SUBSCRIPTION_OPTIONS);
        setIsLoading(false);
        return;
      }

      // Fetch packages from RevenueCat
      const availablePackages = await getAvailablePackages();
      setPackages(availablePackages);

      if (availablePackages.length > 0) {
        // Map RevenueCat packages to our subscription options
        const mappedOptions = mapPackagesToOptions(availablePackages);
        if (mappedOptions.length > 0) {
          setSubscriptionOptions(mappedOptions);
        }
        console.log('✅ Loaded RevenueCat packages:', availablePackages.length);
      } else {
        console.log('⚠️ No packages available - using default options');
      }
    } catch (err) {
      console.error('❌ Failed to load products:', err);
      setError('Failed to load subscription plans');
    } finally {
      setIsLoading(false);
    }
  };

  const mapPackagesToOptions = (pkgs: PurchasesPackage[]): SubscriptionCardData[] => {
    const options: SubscriptionCardData[] = [];

    for (const pkg of pkgs) {
      const identifier = pkg.packageType;
      const product = pkg.product;

      // Determine if this is weekly or monthly based on package type or identifier
      let planId: SubscriptionOption | null = null;
      if (identifier === 'WEEKLY' || pkg.identifier.toLowerCase().includes('week')) {
        planId = 'weekly';
      } else if (identifier === 'MONTHLY' || pkg.identifier.toLowerCase().includes('month')) {
        planId = 'monthly';
      }

      if (planId) {
        // Try to get trial info
        const hasIntroPrice = product.introPrice !== null;
        const trialText = hasIntroPrice
          ? `${product.introPrice?.periodNumberOfUnits}-day free trial`
          : '3-day free trial';

        // Format price text
        const priceText = `then ${product.priceString} per ${planId === 'weekly' ? 'week' : 'month'}`;

        options.push({
          id: planId,
          trialText,
          pricingText: priceText,
          packageType: identifier,
        });
      }
    }

    // Sort to ensure weekly comes first, then monthly
    options.sort((a, b) => (a.id === 'weekly' ? -1 : 1));

    return options;
  };

  const handleSelectPlan = (planId: SubscriptionOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(planId);
  };

  const getSelectedPackage = (): PurchasesPackage | null => {
    if (packages.length === 0) return null;

    // Find the package matching the selected plan
    const pkg = packages.find((p) => {
      const identifier = p.packageType;
      if (selectedPlan === 'weekly') {
        return identifier === 'WEEKLY' || p.identifier.toLowerCase().includes('week');
      } else {
        return identifier === 'MONTHLY' || p.identifier.toLowerCase().includes('month');
      }
    });

    // Fallback to first package if no match
    return pkg || packages[0];
  };

  const handleContinue = async () => {
    if (isPurchasing) return;

    // Check if RevenueCat is available
    if (!isRevenueCatInitialized() || packages.length === 0) {
      Alert.alert(
        'Setup Required',
        'In-app purchases are not configured yet. Please add your RevenueCat API key to enable purchases.',
        [{ text: 'OK' }]
      );
      return;
    }

    const selectedPackage = getSelectedPackage();
    if (!selectedPackage) {
      Alert.alert('Error', 'No subscription plan selected');
      return;
    }

    try {
      setIsPurchasing(true);
      setError(null);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await makePurchase(selectedPackage);

      if (result.success && result.customerInfo) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Check if premium entitlement is now active
        const isPremium = Boolean(result.customerInfo.entitlements.active['premium']);

        if (isPremium) {
          await handlePurchaseSuccess();
        } else {
          // Purchase completed but entitlement not active yet
          // This can happen with pending purchases
          Alert.alert(
            'Purchase Processing',
            'Your purchase is being processed. Please try again in a moment.'
          );
          setIsPurchasing(false);
        }
      } else if (result.userCancelled) {
        // User closed the purchase dialog - no error needed
        setIsPurchasing(false);
      } else {
        // Purchase failed
        setError(result.error || 'Purchase failed');
        Alert.alert('Purchase Failed', result.error || 'Please try again or contact support.');
        setIsPurchasing(false);
      }
    } catch (err) {
      console.error('❌ Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Purchase failed');
      Alert.alert('Purchase Failed', 'Please try again or contact support.');
      setIsPurchasing(false);
    }
  };

  const handlePurchaseSuccess = async () => {
    // Mark onboarding as complete
    await OnboardingStorage.setOnboardingCompleted();
    console.log('✅ Purchase successful - Onboarding completed');

    // Navigate to main app
    router.replace('/');
  };

  const handleRestorePurchases = async () => {
    // Check if RevenueCat is available
    if (!isRevenueCatInitialized()) {
      Alert.alert(
        'Setup Required',
        'In-app purchases are not configured yet. Please add your RevenueCat API key to enable restore.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsPurchasing(true);
      setError(null);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await restorePurchases();

      if (result.success && result.customerInfo) {
        const isPremium = Boolean(result.customerInfo.entitlements.active['premium']);

        if (isPremium) {
          Alert.alert('Success', 'Your purchases have been restored!');
          await handlePurchaseSuccess();
        } else {
          Alert.alert('No Purchases Found', 'No active subscriptions were found for this account.');
          setIsPurchasing(false);
        }
      } else {
        setError(result.error || 'Restore failed');
        Alert.alert('Restore Failed', result.error || 'Please try again or contact support.');
        setIsPurchasing(false);
      }
    } catch (err) {
      console.error('❌ Restore error:', err);
      setError(err instanceof Error ? err.message : 'Restore failed');
      Alert.alert('Restore Failed', 'Please try again or contact support.');
      setIsPurchasing(false);
    }
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Mark onboarding as complete locally
    await OnboardingStorage.setOnboardingCompleted();
    console.log('✅ Onboarding completed via close button');
    // Navigate to main dashboard
    router.replace('/');
  };

  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (err) {
      console.error('Error opening URL:', err);
    }
  };

  // Show loading state while fetching products
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.text} />
        <Text style={styles.loadingText}>Loading subscription plans...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.md,
          paddingBottom: insets.bottom > 0 ? insets.bottom + Spacing.sm : Spacing.md,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Back and Subtle Close Button */}
      <View style={styles.headerRow}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.text} />
          <Text style={styles.backButtonText}>Camera</Text>
        </TouchableOpacity>

        {/* Subtle Close Button - Intentionally Hard to See */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={isPurchasing}
        >
          <Ionicons name="close" size={18} color={Colors.subtleClose} />
        </TouchableOpacity>
      </View>

      {/* Hero Image - Smaller for more compact layout */}
      <View style={styles.heroContainer}>
        <Image
          source={require('@/assets/images/paywall.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Title - More compact */}
      <View style={styles.titleContainer}>
        <StrokedText
          fontSize={36}
          lineHeight={40}
          color={Colors.background}
          strokeColor={Colors.stroke}
        >
          Design your{'\n'}journey
        </StrokedText>
      </View>

      {/* Features List - More compact */}
      <View style={styles.featuresContainer}>
        {FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons
              name="checkmark"
              size={22}
              color={Colors.text}
              style={styles.checkIcon}
            />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Subscription Cards with overlapping circles */}
      <View style={styles.subscriptionWrapper}>
        <View style={styles.subscriptionContainer}>
          {subscriptionOptions.map((option) => {
            const isSelected = selectedPlan === option.id;
            return (
              <View key={option.id} style={styles.cardWrapper}>
                <Pressable
                  style={styles.subscriptionCard}
                  onPress={() => handleSelectPlan(option.id)}
                  disabled={isPurchasing}
                >
                  <Text style={styles.cardTrialText}>{option.trialText}</Text>
                  <Text style={styles.cardPricingText}>{option.pricingText}</Text>
                </Pressable>
                {/* Overlapping circle positioned at bottom center */}
                <Pressable
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                  onPress={() => handleSelectPlan(option.id)}
                  disabled={isPurchasing}
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
        style={[styles.continueButton, isPurchasing && styles.continueButtonDisabled]}
        onPress={handleContinue}
        activeOpacity={0.8}
        disabled={isPurchasing}
      >
        {isPurchasing ? (
          <ActivityIndicator size="small" color={Colors.text} />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
      </TouchableOpacity>

      {/* App Store Compliance Footer */}
      <View style={styles.legalFooter}>
        {/* Subscription Disclosure */}
        <Text style={styles.disclosureText}>
          Subscription automatically renews unless canceled at least 24 hours before the end of
          the current period.
        </Text>

        {/* Legal Links */}
        <View style={styles.legalLinksContainer}>
          <TouchableOpacity onPress={handleRestorePurchases} disabled={isPurchasing}>
            <Text style={styles.legalLinkText}>Restore Purchases</Text>
          </TouchableOpacity>

          <Text style={styles.legalSeparator}>•</Text>

          <TouchableOpacity onPress={() => openURL(TERMS_URL)}>
            <Text style={styles.legalLinkText}>Terms of Use</Text>
          </TouchableOpacity>

          <Text style={styles.legalSeparator}>•</Text>

          <TouchableOpacity onPress={() => openURL(PRIVACY_URL)}>
            <Text style={styles.legalLinkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.paywallPink,
  },
  container: {
    backgroundColor: Colors.paywallPink,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
    color: Colors.text,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    marginLeft: 2,
  },
  closeButton: {
    padding: 4,
    opacity: 0.4, // Make it subtle
  },
  heroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  heroImage: {
    width: 200,
    height: 200,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xs,
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
    marginBottom: 4,
    width: '100%',
  },
  checkIcon: {
    marginRight: Spacing.sm,
    marginTop: 1,
  },
  featureText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    lineHeight: 20,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#FFE5E5',
    borderRadius: NeoBrutalist.borderRadius,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  errorText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.light,
    color: '#CC0000',
    textAlign: 'center',
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
    marginBottom: 16,
  },
  subscriptionCard: {
    backgroundColor: Colors.background,
    borderWidth: NeoBrutalist.borderWidth,
    borderColor: Colors.stroke,
    borderRadius: NeoBrutalist.borderRadius,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md + 12, // Extra padding to clear the overlapping circle
    minHeight: 85,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4,
  },
  cardTrialText: {
    fontSize: FontSize.md,
    fontFamily: Fonts.heavy,
    color: Colors.text,
    lineHeight: 20,
  },
  cardPricingText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.light,
    color: Colors.text,
    lineHeight: 18,
  },
  radioCircle: {
    position: 'absolute',
    bottom: -20,
    left: '50%',
    transform: [{ translateX: -20 }],
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: Spacing.xs,
    minHeight: 50,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.heavy,
    color: Colors.text,
  },
  legalFooter: {
    width: '100%',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    alignItems: 'center',
  },
  disclosureText: {
    fontSize: 10,
    fontFamily: Fonts.light,
    color: Colors.subtleClose,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  legalLinksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  legalLinkText: {
    fontSize: 10,
    fontFamily: Fonts.light,
    color: Colors.subtleClose,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: 10,
    fontFamily: Fonts.light,
    color: Colors.subtleClose,
  },
});
