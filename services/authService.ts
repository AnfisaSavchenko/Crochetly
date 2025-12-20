/**
 * Authentication Service
 * Handles user authentication with Supabase
 *
 * NOTE: Requires @supabase/supabase-js to be installed
 * See SUPABASE_SETUP.md for configuration
 */

import { supabase } from './supabaseClient';
import { OnboardingStorage, QuizData } from './onboardingStorage';

// Dynamic imports for expo packages
let WebBrowser: any;
let Linking: any;

try {
  WebBrowser = require('expo-web-browser');
  Linking = require('expo-linking');
  WebBrowser.maybeCompleteAuthSession?.();
} catch (error) {
  console.warn('expo-web-browser or expo-linking not available');
}

export class AuthService {
  /**
   * Sign in with Google using Supabase Auth
   */
  static async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const redirectUrl = Linking.createURL('/onboarding/auth');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Sign in with Apple using Supabase Auth
   */
  static async signInWithApple(): Promise<{ success: boolean; error?: string }> {
    try {
      const redirectUrl = Linking.createURL('/onboarding/auth');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('Apple sign-in error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error during Apple sign-in:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

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

  /**
   * Complete onboarding flow with authentication
   */
  static async completeOnboardingWithAuth(provider: 'google' | 'apple'): Promise<{ success: boolean; error?: string }> {
    try {
      // Get quiz data
      const quizData = await OnboardingStorage.getQuizData();

      // Sign in with provider
      const result = provider === 'google'
        ? await this.signInWithGoogle()
        : await this.signInWithApple();

      if (!result.success) {
        return result;
      }

      // Wait a moment for auth to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get authenticated user
      const user = await this.getCurrentUser();

      if (!user) {
        return { success: false, error: 'Authentication failed' };
      }

      // Save profile with quiz data
      await this.saveUserProfile(user.id, quizData);

      // Mark onboarding as complete
      await OnboardingStorage.setOnboardingCompleted();

      return { success: true };
    } catch (error) {
      console.error('Error completing onboarding with auth:', error);
      return { success: false, error: 'Failed to complete onboarding' };
    }
  }
}
