/**
 * Onboarding Storage Service
 * Manages onboarding state in AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@crochetly:onboarding_completed';
const QUIZ_DATA_KEY = '@crochetly:quiz_data';

export interface QuizData {
  // Old format (for compatibility)
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  intent?: string; // Comma-separated list of selected intents
  // New format
  level?: string; // 'brand_new' | 'know_some' | 'confident' | 'personality'
  skills?: string; // 'videos' | 'photos' | 'written' | 'mix'
  target?: string; // 'photos' | 'cute_guys' | 'cozy' | 'home' | 'gifts'
  motivation?: string; // 'relax' | 'learn' | 'gifts' | 'sell'
}

export class OnboardingStorage {
  /**
   * Check if user has completed onboarding
   */
  static async isOnboardingCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as completed
   */
  static async setOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error setting onboarding status:', error);
      throw error;
    }
  }

  /**
   * Reset onboarding status (for testing/debugging)
   */
  static async resetOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      await AsyncStorage.removeItem(QUIZ_DATA_KEY);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  }

  /**
   * Save quiz data
   */
  static async saveQuizData(data: QuizData): Promise<void> {
    try {
      const existing = await this.getQuizData();
      const updated = { ...existing, ...data };
      await AsyncStorage.setItem(QUIZ_DATA_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving quiz data:', error);
      throw error;
    }
  }

  /**
   * Get quiz data
   */
  static async getQuizData(): Promise<QuizData> {
    try {
      const value = await AsyncStorage.getItem(QUIZ_DATA_KEY);
      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.error('Error getting quiz data:', error);
      return {};
    }
  }
}
