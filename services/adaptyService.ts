/**
 * Adapty Service
 * Handles initialization and configuration for Adapty SDK
 */

import { adapty } from 'react-native-adapty';

let isInitialized = false;

/**
 * Initialize Adapty SDK
 * Safe to call multiple times - will only initialize once
 */
export async function initializeAdapty(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    const apiKey = process.env.EXPO_PUBLIC_ADAPTY_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ EXPO_PUBLIC_ADAPTY_API_KEY not found - Adapty will run in mock mode');
      // Still initialize - Adapty will auto-enable mock mode in Expo Go/Web
      await adapty.activate('mock_key', {
        __ignoreActivationOnFastRefresh: __DEV__,
      });
      isInitialized = true;
      return;
    }

    await adapty.activate(apiKey, {
      __ignoreActivationOnFastRefresh: __DEV__,
    });

    isInitialized = true;
    console.log('✅ Adapty initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Adapty:', error);
    throw error;
  }
}

/**
 * Get the configured placement ID or default
 */
export function getPlacementId(): string {
  return process.env.EXPO_PUBLIC_ADAPTY_PLACEMENT_ID ?? 'default';
}

/**
 * Check if user has premium access
 */
export async function checkPremiumAccess(): Promise<boolean> {
  try {
    await initializeAdapty();
    const profile = await adapty.getProfile();
    return profile?.accessLevels?.['premium']?.isActive ?? false;
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
}
