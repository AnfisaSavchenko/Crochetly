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
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// Configuration constants
const BUNDLE_ID = 'com.wonderanf.crochetly';
const PREMIUM_ENTITLEMENT = 'premium';
const DEFAULT_OFFERING = 'default';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;
let lastInitError: string | null = null;
let lastOfferingsError: string | null = null;

// Diagnostic info storage
export interface RevenueCatDiagnostics {
  sdkInitialized: boolean;
  apiKeyPresent: boolean;
  apiKeyPrefix: string;
  initError: string | null;
  offeringsError: string | null;
  offeringsCount: number;
  currentOfferingId: string | null;
  packagesCount: number;
  packageIds: string[];
  customerAppUserId: string | null;
  isSandbox: boolean;
  platform: string;
}

let diagnosticInfo: RevenueCatDiagnostics = {
  sdkInitialized: false,
  apiKeyPresent: false,
  apiKeyPrefix: '',
  initError: null,
  offeringsError: null,
  offeringsCount: 0,
  currentOfferingId: null,
  packagesCount: 0,
  packageIds: [],
  customerAppUserId: null,
  isSandbox: true,
  platform: Platform.OS,
};

/**
 * Get current diagnostic info for debugging
 */
export function getDiagnostics(): RevenueCatDiagnostics {
  return { ...diagnosticInfo };
}

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

      // Update diagnostic info
      diagnosticInfo.apiKeyPresent = Boolean(apiKey);
      diagnosticInfo.apiKeyPrefix = apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET';
      diagnosticInfo.platform = Platform.OS;

      if (!apiKey) {
        const errorMsg = 'EXPO_PUBLIC_REVENUECAT_API_KEY not found in environment';
        console.warn(`⚠️ ${errorMsg}`);
        lastInitError = errorMsg;
        diagnosticInfo.initError = errorMsg;
        return;
      }

      console.log('═══════════════════════════════════════════════════');
      console.log('🔧 RevenueCat Initialization');
      console.log('═══════════════════════════════════════════════════');
      console.log(`   Platform: ${Platform.OS}`);
      console.log(`   API Key: ${apiKey.substring(0, 15)}...`);
      console.log(`   Bundle ID: ${BUNDLE_ID}`);

      // Enable verbose logging for debugging (sandbox mode)
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
      console.log('   Log Level: VERBOSE (for debugging)');

      // Configure RevenueCat with the API key
      await Purchases.configure({ apiKey });

      isInitialized = true;
      diagnosticInfo.sdkInitialized = true;
      diagnosticInfo.initError = null;
      lastInitError = null;

      // Get customer info to verify connection
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        diagnosticInfo.customerAppUserId = customerInfo.originalAppUserId;
        diagnosticInfo.isSandbox = customerInfo.entitlements.all ? true : true; // Sandbox by default in dev

        console.log(`   App User ID: ${customerInfo.originalAppUserId}`);
        console.log(`   Active Entitlements: ${Object.keys(customerInfo.entitlements.active).join(', ') || 'None'}`);
      } catch (customerError) {
        console.log('   Could not fetch customer info (will retry on demand)');
      }

      console.log('═══════════════════════════════════════════════════');
      console.log(`✅ RevenueCat initialized successfully`);
      console.log('═══════════════════════════════════════════════════');

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('═══════════════════════════════════════════════════');
      console.error('❌ RevenueCat Initialization FAILED');
      console.error(`   Error: ${errorMsg}`);
      console.error('═══════════════════════════════════════════════════');

      lastInitError = errorMsg;
      diagnosticInfo.initError = errorMsg;
      diagnosticInfo.sdkInitialized = false;
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
      const errorMsg = lastInitError || 'SDK not initialized';
      diagnosticInfo.offeringsError = errorMsg;
      return null;
    }

    console.log('───────────────────────────────────────────────────');
    console.log('📦 Fetching RevenueCat Offerings...');

    const offerings = await Purchases.getOfferings();

    // Update diagnostic info
    diagnosticInfo.offeringsCount = offerings.all ? Object.keys(offerings.all).length : 0;
    diagnosticInfo.currentOfferingId = offerings.current?.identifier || null;
    diagnosticInfo.offeringsError = null;
    lastOfferingsError = null;

    console.log(`   Total Offerings: ${diagnosticInfo.offeringsCount}`);
    console.log(`   Current Offering: ${diagnosticInfo.currentOfferingId || 'NOT SET'}`);

    if (offerings.all) {
      Object.keys(offerings.all).forEach(key => {
        const offering = offerings.all[key];
        console.log(`   - Offering "${key}": ${offering.availablePackages.length} packages`);
        offering.availablePackages.forEach(pkg => {
          console.log(`     • ${pkg.identifier} (${pkg.packageType}): ${pkg.product.priceString}`);
        });
      });
    }

    if (!offerings.current && diagnosticInfo.offeringsCount === 0) {
      const warnMsg = 'No offerings configured in RevenueCat dashboard';
      console.warn(`⚠️ ${warnMsg}`);
      diagnosticInfo.offeringsError = warnMsg;
    }

    console.log('───────────────────────────────────────────────────');

    return offerings;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('───────────────────────────────────────────────────');
    console.error('❌ Failed to get offerings');
    console.error(`   Error: ${errorMsg}`);
    console.error('───────────────────────────────────────────────────');

    lastOfferingsError = errorMsg;
    diagnosticInfo.offeringsError = errorMsg;
    return null;
  }
}

/**
 * Get available packages from current offering
 * Fetches from the 'default' offering
 */
export async function getAvailablePackages(): Promise<PurchasesPackage[]> {
  const offerings = await getOfferings();

  let packages: PurchasesPackage[] = [];

  // First try the current/default offering
  if (offerings?.current?.availablePackages?.length) {
    console.log('📦 Using current offering:', offerings.current.identifier);
    packages = offerings.current.availablePackages;
  }
  // Fallback to 'default' offering by name
  else if (offerings?.all?.[DEFAULT_OFFERING]?.availablePackages?.length) {
    console.log('📦 Using "default" offering');
    packages = offerings.all[DEFAULT_OFFERING].availablePackages;
  }
  // Try any available offering as last resort
  else if (offerings?.all) {
    const offeringKeys = Object.keys(offerings.all);
    console.log('📦 Available offerings:', offeringKeys);

    if (offeringKeys.length > 0) {
      const firstOffering = offerings.all[offeringKeys[0]];
      if (firstOffering.availablePackages.length > 0) {
        console.log(`📦 Using first available offering: "${offeringKeys[0]}"`);
        packages = firstOffering.availablePackages;
      }
    }
  }

  // Update diagnostic info
  diagnosticInfo.packagesCount = packages.length;
  diagnosticInfo.packageIds = packages.map(p => `${p.identifier} (${p.product.identifier})`);

  if (packages.length === 0) {
    console.warn('⚠️ No packages available');
    console.warn('   Check RevenueCat dashboard:');
    console.warn('   1. Create products in App Store Connect');
    console.warn('   2. Add products to RevenueCat');
    console.warn('   3. Create an offering with packages');
    console.warn('   4. Set the offering as "current"');
  }

  return packages;
}

/**
 * Get the last initialization error
 */
export function getLastInitError(): string | null {
  return lastInitError;
}

/**
 * Get the last offerings error
 */
export function getLastOfferingsError(): string | null {
  return lastOfferingsError;
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
