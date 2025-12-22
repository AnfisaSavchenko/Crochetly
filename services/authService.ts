/**
 * Authentication Service
 * Handles user authentication with Supabase and @fastshot/auth
 */

import { supabase } from './supabaseClient';
import { OnboardingStorage, QuizData } from './onboardingStorage';

export class AuthService {
  /**
   * Save user quiz data to Supabase profile
   */
  static async saveUserProfile(userId: string, quizData: QuizData): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          skill_level: quizData.skillLevel,
          creation_intent: quizData.intent,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving user profile:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save user profile:', error);
      throw error;
    }
  }

  /**
   * Save user profile after successful authentication
   * Called from the auth callback in _layout.tsx
   */
  static async saveUserProfileAfterAuth(userId: string): Promise<void> {
    try {
      // Get quiz data from storage
      const quizData = await OnboardingStorage.getQuizData();

      // Save profile with quiz data
      await this.saveUserProfile(userId, quizData);

      // Mark onboarding as complete
      await OnboardingStorage.setOnboardingCompleted();

      console.log('User profile saved successfully after authentication');
    } catch (error) {
      console.error('Error saving user profile after auth:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }

    return user;
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
}
