// ============================================================================
// OAUTH INTEGRATION FILE (Firebase)
// ============================================================================
// INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com/ (You can log in with your "other email" here to keep it separate)
// 2. Create a new Firebase project.
// 3. Go to "Build" -> "Authentication" -> "Sign-in method"
// 4. Enable "Google" and "GitHub" (or whichever you prefer).
// 5. Go to Project Settings and add a Web App. Copy the Firebase config object.
// 6. Replace the placeholder values in `firebaseConfig` below with your actual keys.
// 7. Install firebase: Run `npm install firebase` in your terminal.
// ============================================================================

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signOut 
} from 'firebase/auth';

// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Successfully logged in with Google:", user.email);
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error.message);
    throw error;
  }
};

/**
 * Sign in with GitHub OAuth
 */
export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const user = result.user;
    console.log("Successfully logged in with GitHub:", user.email);
    return user;
  } catch (error) {
    console.error("Error signing in with GitHub:", error.message);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("Successfully logged out");
  } catch (error) {
    console.error("Error signing out:", error.message);
    throw error;
  }
};
