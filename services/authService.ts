import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

class AuthService {
  async signup(email: string, password: string, name: string): Promise<User> {
    // Check if Supabase is properly configured
    const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      throw new Error('Supabase not configured. Please add environment variables.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Failed to create user');
    }

    return data.user;
  }

  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Failed to sign in');
    }

    return data.user;
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getAuthState(): Promise<AuthState> {
    const { data: { user } } = await supabase.auth.getUser();
    return {
      user,
      isAuthenticated: !!user
    };
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }

  // Check if user is authenticated on app load
  async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }

  // Reset password via email
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `https://theinstructorshub.co.uk`
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  // Update user password
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}

export const authService = new AuthService();
export type { User, AuthState };
