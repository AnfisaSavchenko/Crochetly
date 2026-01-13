/**
 * Image Preloader Service
 * Preloads and caches onboarding images for instant display
 */

import { Asset } from 'expo-asset';

// Define all onboarding images that need preloading
const ONBOARDING_IMAGES = [
  require('@/assets/images/lowerstresslevel.png'),
  require('@/assets/images/didyuknow2.png'),
  require('@/assets/images/fromlondontoparis.png'),
  require('@/assets/images/clock.png'),
];

export class ImagePreloader {
  private static isPreloaded = false;

  /**
   * Preload all onboarding images
   * This ensures images are cached and ready for instant display
   */
  static async preloadImages(): Promise<void> {
    // Skip if already preloaded
    if (this.isPreloaded) {
      return;
    }

    try {
      console.log('🖼️ Starting image preload...');

      // Load all images in parallel for faster preloading
      const imageAssets = ONBOARDING_IMAGES.map((image) => {
        return Asset.fromModule(image).downloadAsync();
      });

      await Promise.all(imageAssets);

      this.isPreloaded = true;
      console.log('✅ All onboarding images preloaded successfully');
    } catch (error) {
      console.error('❌ Error preloading images:', error);
      // Don't throw - allow app to continue even if preload fails
    }
  }

  /**
   * Get preload status
   */
  static getPreloadStatus(): boolean {
    return this.isPreloaded;
  }

  /**
   * Force reload images (useful for development/testing)
   */
  static async forceReload(): Promise<void> {
    this.isPreloaded = false;
    await this.preloadImages();
  }
}
