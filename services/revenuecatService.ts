/**
 * RevenueCat Service
 * Handles initialization and configuration for RevenueCat SDK
 * Bundle ID: com.wonderanf.crochetly
 * Entitlement: "premium"
 * Offerings: "default" with $rc_weekly and $rc_monthly packages
 */

import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
  PURCHASES_ERROR_CODE,
  PurchasesError,
  PurchasesStoreProduct,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// Configuration constants
const BUNDLE_ID = 'com.wonderanf.crochetly';
const PREMIUM_ENTITLEMENT = 'premium';
const DEFAULT_OFFERING = 'default';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize RevenueCat SDK
 * Safe to call multiple times - will only initialize once
 * Uses bundle ID: com.wonderanf.crochetly
 */
export async function initializeRevenueCat(): Promise<void> {
  // Return existing initialization if in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  if (isInitialized) {
    return;
  }

  initializationPromise = (async () => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

      if (!apiKey) {
        console.warn('⚠️ EXPO_PUBLIC_REVENUECAT_API_KEY not found - RevenueCat features will be limited');
        return;
      }

      // Configure RevenueCat with the API key
      // The SDK automatically uses the app's bundle ID from the native configuration
      await Purchases.configure({ apiKey });

      isInitialized = true;
      console.log(`✅ RevenueCat initialized for ${Platform.OS}`);
      console.log(`   Bundle ID: ${BUNDLE_ID}`);
      console.log(`   Entitlement: ${PREMIUM_ENTITLEMENT}`);
    } catch (error) {
      console.error('❌ Failed to initialize RevenueCat:', error);
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Check if RevenueCat is initialized
 */
export function isRevenueCatInitialized(): boolean {
  return isInitialized;
}

/**
 * Get current offerings from RevenueCat
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    await initializeRevenueCat();

    if (!isInitialized) {
      return null;
    }

    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('❌ Failed to get offerings:', error);
    return null;
  }
}

/**
 * Get available packages from current offering
 * Fetches from the 'default' offering
 */
export async function getAvailablePackages(): Promise<PurchasesPackage[]> {
  const offerings = await getOfferings();

  // First try the current/default offering
  if (offerings?.current?.availablePackages?.length) {
    console.log('📦 Using current offering:', offerings.current.identifier);
    return offerings.current.availablePackages;
  }

  // Fallback to 'default' offering by name
  if (offerings?.all?.['default']?.availablePackages?.length) {
    console.log('📦 Using "default" offering');
    return offerings.all['default'].availablePackages;
  }

  // Log available offerings for debugging
  if (offerings?.all) {
    console.log('📦 Available offerings:', Object.keys(offerings.all));
  }

  return [];
}

/**
 * Make a purchase
 * Returns the customer info if successful
 */
export async function makePurchase(pkg: PurchasesPackage): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  userCancelled?: boolean;
  error?: string;
}> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (error) {
    const purchaseError = error as PurchasesError;

    if (purchaseError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { success: false, userCancelled: true };
    }

    console.error('❌ Purchase error:', error);
    return {
      success: false,
      error: purchaseError.message || 'Purchase failed'
    };
  }
}

/**
 * Restore purchases
 * Returns the customer info if successful
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: true, customerInfo };
  } catch (error) {
    const purchaseError = error as PurchasesError;
    console.error('❌ Restore error:', error);
    return {
      success: false,
      error: purchaseError.message || 'Restore failed'
    };
  }
}

/**
 * Check if user has premium access via the "premium" entitlement
 */
export async function checkPremiumAccess(): Promise<boolean> {
  try {
    await initializeRevenueCat();

    if (!isInitialized) {
      return false;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]);
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
}

/**
 * Check if a customer has the premium entitlement from CustomerInfo
 */
export function hasPremiumEntitlement(customerInfo: CustomerInfo): boolean {
  return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]);
}

/**
 * Extract trial period information from a product
 * Returns the number of trial days, or 0 if no trial
 */
export function getTrialDays(product: PurchasesStoreProduct): number {
  try {
    // Check for introductory price with free trial
    const introPrice = product.introPrice;
    if (introPrice && introPrice.price === 0) {
      // Extract trial period from the intro price
      const periodUnit = introPrice.periodUnit;
      const periodNumberOfUnits = introPrice.periodNumberOfUnits;

      if (periodUnit === 'DAY') {
        return periodNumberOfUnits;
      } else if (periodUnit === 'WEEK') {
        return periodNumberOfUnits * 7;
      } else if (periodUnit === 'MONTH') {
        return periodNumberOfUnits * 30;
      }
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Format trial period text for display
 */
export function formatTrialText(trialDays: number): string {
  if (trialDays === 0) return '';
  if (trialDays === 1) return '1-day free trial';
  if (trialDays === 3) return '3-day free trial';
  if (trialDays === 7) return '7-day free trial';
  if (trialDays === 14) return '14-day free trial';
  if (trialDays === 30) return '1-month free trial';
  return `${trialDays}-day free trial`;
}

/**
 * Get customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    await initializeRevenueCat();

    if (!isInitialized) {
      return null;
    }

    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Error getting customer info:', error);
    return null;
  }
}

/**
 * Identify user (for user-specific purchases tracking)
 */
export async function identifyUser(userId: string): Promise<void> {
  try {
    await initializeRevenueCat();

    if (!isInitialized) {
      return;
    }

    await Purchases.logIn(userId);
    console.log('✅ RevenueCat user identified:', userId);
  } catch (error) {
    console.error('Error identifying user:', error);
  }
}

/**
 * Log out user
 */
export async function logOutUser(): Promise<void> {
  try {
    if (!isInitialized) {
      return;
    }

    await Purchases.logOut();
    console.log('✅ RevenueCat user logged out');
  } catch (error) {
    console.error('Error logging out user:', error);
  }
}
