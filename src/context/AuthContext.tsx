import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, UserInfo, UserPreferences } from '../services/api';

interface AuthContextType {
  user: UserInfo | null;
  preferences: UserPreferences;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserInfo, prefs?: UserPreferences) => void;
  logout: () => void;
  updateLanguage: (lang: string) => void;
  updateLevel: (lvl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cognitive_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<UserPreferences>({
    selected_language: localStorage.getItem('cognitive_lang') || 'python',
    current_level: localStorage.getItem('cognitive_level') || 'beginner',
    preferred_mode: 'adaptive'
  });

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        setUser(data.user);
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      } catch (err) {
        console.warn('Session expired');
        localStorage.removeItem('cognitive_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, [token]);

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

  const logout = () => {
    localStorage.removeItem('cognitive_token');
    setToken(null);
    setUser(null);
  };

  const updateLanguage = (lang: string) => {
    setPreferences(prev => ({ ...prev, selected_language: lang }));
    localStorage.setItem('cognitive_lang', lang);
    if (user) {
      api.updatePreferences({ selected_language: lang });
    }
  };

  const updateLevel = (lvl: string) => {
    setPreferences(prev => ({ ...prev, current_level: lvl }));
    localStorage.setItem('cognitive_level', lvl);
    if (user) {
      api.updatePreferences({ current_level: lvl });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        preferences,
        token,
        isLoading,
        login,
        logout,
        updateLanguage,
        updateLevel
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
