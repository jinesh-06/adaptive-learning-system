import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  Unsubscribe
} from 'firebase/auth';
import { auth, googleProvider, githubProvider, isFirebaseConfigured } from './firebase';
import { api, UserInfo } from './api';

export interface ExtendedUserProfile extends UserInfo {
  uid: string;
  photoURL?: string;
  providerId: string;
  emailVerified: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

/**
 * Converts Firebase auth error codes into friendly user messages.
 */
export function formatFirebaseAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error?.code || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address format.';
    case 'auth/user-not-found':
      return 'No account exists with this email address. Please sign up first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters with mixed letters and numbers.';
    case 'auth/popup-closed-by-user':
      return 'Authentication popup was closed before completing sign in.';
    case 'auth/cancelled-popup-request':
      return 'Sign in request was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Sign in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email using a different sign-in method.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to many failed attempts. Reset your password or try again later.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact platform support.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is currently disabled in the Firebase Console.';
    default:
      return error?.message || 'Authentication error. Please check your credentials and try again.';
  }
}

/**
 * Map Firebase User object to platform UserInfo and ExtendedUserProfile
 */
export function mapFirebaseUser(user: FirebaseUser): ExtendedUserProfile {
  const providerData = user.providerData[0];
  const providerId = providerData?.providerId || 'password';

  return {
    id: user.uid,
    uid: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Learner',
    email: user.email || '',
    role: 'student',
    provider: providerId,
    providerId: providerId,
    photoURL: user.photoURL || undefined,
    avatar_url: user.photoURL || undefined,
    emailVerified: user.emailVerified,
    createdAt: user.metadata?.creationTime,
    lastLoginAt: user.metadata?.lastSignInTime
  };
}

/**
 * Reusable Firebase Authentication Service
 */
export const firebaseAuth = {
  /**
   * Register with Email & Password
   */
  async register(params: { name: string; email: string; password: string }) {
    if (!isFirebaseConfigured || !auth) {
      // Graceful fallback to backend/mock when Firebase environment keys are not yet configured
      return await api.register({
        name: params.name,
        email: params.email,
        password: params.password,
        role: 'student'
      });
    }

    const credential = await createUserWithEmailAndPassword(auth, params.email, params.password);
    
    // Update user display name
    if (params.name) {
      await updateProfile(credential.user, { displayName: params.name }).catch(() => {});
    }

    // Send email verification link
    try {
      await sendEmailVerification(credential.user);
    } catch (e) {
      console.warn('sendEmailVerification non-fatal warning:', e);
    }

    const idToken = await credential.user.getIdToken();
    const mappedUser = mapFirebaseUser(credential.user);

    // Sync user with backend
    try {
      await api.register({
        name: params.name,
        email: params.email,
        password: params.password,
        role: 'student'
      });
    } catch {
      // Backend sync fallback
    }

    return {
      success: true,
      token: idToken,
      user: mappedUser,
      emailVerificationSent: true
    };
  },

  /**
   * Sign In with Email & Password
   */
  async login(params: { email: string; password: string }) {
    if (!isFirebaseConfigured || !auth) {
      return await api.login({ email: params.email, password: params.password });
    }

    const credential = await signInWithEmailAndPassword(auth, params.email, params.password);
    const idToken = await credential.user.getIdToken();
    const mappedUser = mapFirebaseUser(credential.user);

    // Sync with backend
    try {
      await api.login({ email: params.email, password: params.password });
    } catch {
      // Backend sync fallback
    }

    return {
      success: true,
      token: idToken,
      user: mappedUser
    };
  },

  /**
   * Google Sign-In with Popup
   */
  async signInWithGoogle() {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      return await api.oauthLogin({ provider: 'google' });
    }

    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const mappedUser = mapFirebaseUser(result.user);

    // Sync with backend database
    try {
      await api.oauthLogin({
        provider: 'google',
        email: result.user.email || undefined,
        name: result.user.displayName || undefined,
        avatar_url: result.user.photoURL || undefined
      });
    } catch {
      // Backend sync fallback
    }

    return {
      success: true,
      token: idToken,
      user: mappedUser
    };
  },

  /**
   * GitHub Sign-In with Popup
   */
  async signInWithGithub() {
    if (!isFirebaseConfigured || !auth || !githubProvider) {
      return await api.oauthLogin({ provider: 'github' });
    }

    const result = await signInWithPopup(auth, githubProvider);
    const idToken = await result.user.getIdToken();
    const mappedUser = mapFirebaseUser(result.user);

    // Sync with backend database
    try {
      await api.oauthLogin({
        provider: 'github',
        email: result.user.email || undefined,
        name: result.user.displayName || undefined,
        avatar_url: result.user.photoURL || undefined
      });
    } catch {
      // Backend sync fallback
    }

    return {
      success: true,
      token: idToken,
      user: mappedUser
    };
  },

  /**
   * Send Password Reset Email
   */
  async resetPassword(email: string) {
    if (!isFirebaseConfigured || !auth) {
      return await api.forgotPassword(email);
    }

    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: `Password reset email sent to ${email}. Please check your inbox and spam folder.`
    };
  },

  /**
   * Sign Out
   */
  async logout() {
    if (isFirebaseConfigured && auth) {
      await signOut(auth).catch((err) => console.warn('Firebase signOut warning:', err));
    }
  },

  /**
   * Subscribe to Firebase Auth State Changes
   */
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): Unsubscribe {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, callback);
    }
    // Return empty unsubscribe if not configured
    return () => {};
  }
};
