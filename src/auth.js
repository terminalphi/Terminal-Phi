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

// Initialize Supabase Client only when configured, so a missing .env never
// crashes the whole app (auth simply becomes a no-op / falls back).
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn('[auth] Supabase env not configured — sign-in disabled, falling back.');
}

/**
 * Sign in with Google OAuth.
 * @param {string} redirectPath - path to return to after auth (default: the join form)
 */
export const signInWithGoogle = async (redirectPath = '/join_us') => {
  if (!supabase) throw new Error('Supabase not configured');
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect back to the requested page after login
        redirectTo: window.location.origin + redirectPath,
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
  if (!supabase) return;
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
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Subscribe to auth state changes. Calls `callback(user|null)` whenever the
 * session changes (sign in / sign out). Returns an object with .unsubscribe().
 */
export const onAuthChange = (callback) => {
  if (!supabase) return { unsubscribe: () => {} };
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return data.subscription;
};

/**
 * Auth gate used by the "Login" (navbar) and "Join Us" (hero) buttons.
 * - If the user already has a session, send them straight to the join form.
 * - Otherwise take them to the auth page to sign in (which returns to the
 *   join form afterwards).
 * - If auth is unavailable (e.g. Supabase not configured), still let the
 *   user reach the form so the site never dead-ends.
 */
export const proceedToJoin = async (navigate) => {
  try {
    const user = await getCurrentUser();
    if (user) {
      navigate('/join_us');
      return;
    }
    navigate('/signin?next=/join_us');
  } catch (error) {
    console.error('Auth flow error:', error?.message || error);
    navigate('/join_us');
  }
};
