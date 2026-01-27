/**
 * RevenueCat Service
 * Handles initialization and configuration for RevenueCat SDK
 * Replaces Adapty for in-app purchases and subscriptions
 */

import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
  PURCHASES_ERROR_CODE,
  PurchasesError
} from 'react-native-purchases';

let isInitialized = false;

/**
 * Initialize RevenueCat SDK
 * Safe to call multiple times - will only initialize once
 */
export async function initializeRevenueCat(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ EXPO_PUBLIC_REVENUECAT_API_KEY not found - RevenueCat features will be limited');
      // In development without a key, we can't initialize properly
      // The paywall will handle this gracefully with mock data
      return;
    }

    await Purchases.configure({ apiKey });

    isInitialized = true;
    console.log('✅ RevenueCat initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize RevenueCat:', error);
    throw error;
  }
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
    return Boolean(customerInfo.entitlements.active['premium']);
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
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
