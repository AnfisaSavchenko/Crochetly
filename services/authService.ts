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
      console.log('      Preparing profile data for user:', userId);

      // Combine old and new quiz data formats
      const profileData = {
        id: userId,
        // Old format (for backward compatibility)
        skill_level: quizData.skillLevel || quizData.level || '',
        creation_intent: quizData.intent || '',
        // New format - store as JSON string
        quiz_responses: JSON.stringify({
          level: quizData.level,
          skills: quizData.skills,
          target: quizData.target,
          motivation: quizData.motivation,
        }),
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      console.log('      Profile data prepared:', {
        id: profileData.id,
        skill_level: profileData.skill_level,
        creation_intent: profileData.creation_intent,
        onboarding_completed: profileData.onboarding_completed,
      });

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData)
        .select();

      if (error) {
        console.error('      ❌ Supabase error:', error.message);
        console.error('      Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('      ✅ Profile upserted successfully');
      if (data && data.length > 0) {
        console.log('      Profile record:', data[0]);
      }
    } catch (error) {
      console.error('      ❌ Failed to save user profile:', error);
      if (error instanceof Error) {
        console.error('      Error type:', error.constructor.name);
        console.error('      Error message:', error.message);
      }
      throw error;
    }
  }

  /**
   * Save user profile after successful authentication
   * Called from the auth callback in _layout.tsx
   */
  static async saveUserProfileAfterAuth(userId: string): Promise<void> {
    try {
      console.log('📝 Starting profile save process...');

      // Get quiz data from storage
      const quizData = await OnboardingStorage.getQuizData();
      console.log('   Quiz data retrieved:', Object.keys(quizData).length > 0 ? '✅' : '⚠️ Empty');

      // Save profile with quiz data
      console.log('   Saving to Supabase...');
      await this.saveUserProfile(userId, quizData);
      console.log('   ✅ Profile saved to database');

      // Mark onboarding as complete
      console.log('   Marking onboarding complete...');
      await OnboardingStorage.setOnboardingCompleted();
      console.log('   ✅ Onboarding flag set');

      // Verify the flag was set
      const isCompleted = await OnboardingStorage.isOnboardingCompleted();
      console.log('   Verification:', isCompleted ? '✅ Confirmed' : '❌ Failed to set');

      console.log('✨ User profile saved successfully after authentication');
    } catch (error) {
      console.error('❌ Error saving user profile after auth:', error);
      if (error instanceof Error) {
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack);
      }
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
