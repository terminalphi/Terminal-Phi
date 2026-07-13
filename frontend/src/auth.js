// OAuth integration (Supabase + direct Google sign-in). The Google popup is
// branded "Terminal Phi" via @react-oauth/google; its ID token is then handed
// to Supabase to create a proper session.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn('[auth] Supabase env not configured — sign-in disabled, falling back.');
}

/**
 * Sign in using a Google ID token (from @react-oauth/google).
 * This creates a Supabase session WITHOUT redirecting through supabase.co.
 */
export const signInWithGoogleToken = async (idToken) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
  return data;
};

/**
 * Redirect-based Google sign-in via Supabase. Works with any custom-styled
 * button (the browser redirects to Google, then back to `redirectPath`).
 * @param {string} redirectPath - where to land after auth.
 */
export const signInWithGoogle = async (redirectPath = '/home') => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + redirectPath },
  });
  if (error) throw error;
  return data;
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
 * Fetch the signed-in user's profile from member_profiles.
 * Returns the profile row or null if none exists.
 */
export const getProfile = async (userId) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('id', userId)
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data ?? null;
};

/**
 * Insert or update the signed-in user's profile in member_profiles.
 * Uses upsert so it works for both first-time creation and edits.
 */
export const upsertProfile = async (profile) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('member_profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

