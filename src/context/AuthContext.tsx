import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { api, UserInfo, UserPreferences } from '../services/api';
import { firebaseAuth, mapFirebaseUser, formatFirebaseAuthError, ExtendedUserProfile } from '../services/firebaseAuth';
import { isFirebaseConfigured } from '../services/firebase';

interface AuthContextType {
  user: UserInfo | null;
  firebaseUser: FirebaseUser | null;
  preferences: UserPreferences;
  token: string | null;
  isLoading: boolean;
  isFirebaseActive: boolean;
  login: (token: string, user: UserInfo, prefs?: UserPreferences) => void;
  logout: () => Promise<void>;
  updateLanguage: (lang: string) => void;
  updateLevel: (lvl: string) => void;
  // Firebase Auth direct helpers
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; user?: UserInfo; error?: string }>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<{ success: boolean; user?: UserInfo; error?: string; verificationSent?: boolean }>;
  signInWithGoogle: () => Promise<{ success: boolean; user?: UserInfo; error?: string }>;
  signInWithGithub: () => Promise<{ success: boolean; user?: UserInfo; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cognitive_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<UserPreferences>({
    selected_language: localStorage.getItem('cognitive_lang') || 'python',
    current_level: localStorage.getItem('cognitive_level') || 'beginner',
    preferred_mode: 'adaptive'
  });

  // Load preferences from backend or local storage
  const syncPreferences = useCallback(async () => {
    try {
      const data = await api.getMe();
      if (data?.preferences) {
        setPreferences(data.preferences);
        localStorage.setItem('cognitive_lang', data.preferences.selected_language);
        localStorage.setItem('cognitive_level', data.preferences.current_level);
      }
    } catch {
      // Offline fallback
    }
  }, []);

  // Firebase onAuthStateChanged listener
  useEffect(() => {
    let isMounted = true;

    if (isFirebaseConfigured) {
      const unsubscribe = firebaseAuth.onAuthStateChange(async (fbUser) => {
        if (!isMounted) return;

        if (fbUser) {
          try {
            const idToken = await fbUser.getIdToken();
            const mapped = mapFirebaseUser(fbUser);

            if (isMounted) {
              setFirebaseUser(fbUser);
              setUser(mapped);
              setToken(idToken);
              localStorage.setItem('cognitive_token', idToken);
            }

            // Sync profile / preferences
            await syncPreferences();
          } catch (err) {
            console.error('Error handling Firebase Auth state:', err);
          } finally {
            if (isMounted) setIsLoading(false);
          }
        } else {
          // Check if there is a manual mock/backend session preserved
          const storedToken = localStorage.getItem('cognitive_token');
          if (storedToken && storedToken.startsWith('mock_')) {
            // Keep local mock session if in offline/demo mode
            if (isMounted) setIsLoading(false);
          } else {
            if (isMounted) {
              setFirebaseUser(null);
              setUser(null);
              setToken(null);
              localStorage.removeItem('cognitive_token');
              setIsLoading(false);
            }
          }
        }
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } else {
      // Fallback for non-Firebase configured environments (e.g. backend token check)
      const initNonFirebaseSession = async () => {
        const storedToken = localStorage.getItem('cognitive_token');
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        try {
          const data = await api.getMe();
          if (isMounted && data?.user) {
            setUser(data.user);
            if (data.preferences) {
              setPreferences(data.preferences);
            }
          }
        } catch {
          if (isMounted) {
            localStorage.removeItem('cognitive_token');
            setToken(null);
            setUser(null);
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };

      initNonFirebaseSession();
      return () => {
        isMounted = false;
      };
    }
  }, [syncPreferences]);

  // Manual login adapter for backward compatibility
  const login = (newToken: string, newUser: UserInfo, newPrefs?: UserPreferences) => {
    localStorage.setItem('cognitive_token', newToken);
    setToken(newToken);
    setUser(newUser);
    if (newPrefs) {
      setPreferences(newPrefs);
      localStorage.setItem('cognitive_lang', newPrefs.selected_language);
      localStorage.setItem('cognitive_level', newPrefs.current_level);
    }
  };

  // Sign out handler
  const logout = async () => {
    try {
      await firebaseAuth.logout();
    } catch (e) {
      console.warn('SignOut warning:', e);
    }
    localStorage.removeItem('cognitive_token');
    setToken(null);
    setUser(null);
    setFirebaseUser(null);
  };

  // Helper actions
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const res = await firebaseAuth.login({ email, password: pass });
      if (res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('cognitive_token', res.token);
      }
      return { success: true, user: res.user };
    } catch (err: any) {
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    try {
      const res = await firebaseAuth.register({ name, email, password: pass });
      if (res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('cognitive_token', res.token);
      }
      return { success: true, user: res.user, verificationSent: (res as any).emailVerificationSent };
    } catch (err: any) {
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const res = await firebaseAuth.signInWithGoogle();
      if (res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('cognitive_token', res.token);
      }
      return { success: true, user: res.user };
    } catch (err: any) {
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  const signInWithGithub = async () => {
    try {
      const res = await firebaseAuth.signInWithGithub();
      if (res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('cognitive_token', res.token);
      }
      return { success: true, user: res.user };
    } catch (err: any) {
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const res = await firebaseAuth.resetPassword(email);
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  const updateLanguage = (lang: string) => {
    setPreferences((prev) => ({ ...prev, selected_language: lang }));
    localStorage.setItem('cognitive_lang', lang);
    if (user) {
      api.updatePreferences({ selected_language: lang });
    }
  };

  const updateLevel = (lvl: string) => {
    setPreferences((prev) => ({ ...prev, current_level: lvl }));
    localStorage.setItem('cognitive_level', lvl);
    if (user) {
      api.updatePreferences({ current_level: lvl });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        preferences,
        token,
        isLoading,
        isFirebaseActive: isFirebaseConfigured,
        login,
        logout,
        updateLanguage,
        updateLevel,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithGithub,
        sendPasswordReset
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
