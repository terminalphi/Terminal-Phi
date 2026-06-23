// ============================================================================
// OAUTH INTEGRATION FILE (Supabase)
// ============================================================================
// CONFIG:
// Supabase URL and anon (public) key are read from environment variables
// defined in the project's `.env` file:
//   VITE_SUPABASE_URL=...
//   VITE_SUPABASE_ANON_KEY=...
// The anon key is a publishable key and is safe to expose to the client.
// Run `npm install @supabase/supabase-js` if it is not already installed.
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// Read Supabase project URL and anon key from environment (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect back to the site after login
        redirectTo: window.location.origin + '/home',
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error signing in with Google:", error.message);
    throw error;
  }
};


/**
 * Sign out the current user
 */
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log("Successfully logged out");
  } catch (error) {
    console.error("Error signing out:", error.message);
    throw error;
  }
};

/**
 * Get the currently logged-in user
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
