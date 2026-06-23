// ============================================================================
// OAUTH INTEGRATION FILE (Supabase)
// ============================================================================
// INSTRUCTIONS:
// 1. Go to https://supabase.com/ and sign in (you can use your "other email" here).
// 2. Create a new Project.
// 3. Navigate to "Authentication" -> "Providers" in the dashboard.
// 4. Enable the Google OAuth provider and configure its Client ID and Secret.
// 5. Navigate to "Project Settings" -> "API" to find your URL and anon key.
// 6. Replace the placeholder values in the `createClient` function below with 
//    your actual Supabase URL and anon public key.
// 7. Install Supabase: Run `npm install @supabase/supabase-js` in your terminal.
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

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
