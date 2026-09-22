import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  effectiveTheme: 'dark' | 'light';
  reducedMotion: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleReducedMotion: () => void;
  monacoTheme: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('cognitive_theme') as ThemeMode) || 'dark';
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('cognitive_reduced_motion') === 'true';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const root = document.documentElement;

    let target: 'dark' | 'light' = 'dark';
    if (theme === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      target = prefersDark ? 'dark' : 'light';
    } else {
      target = theme;
    }

    setEffectiveTheme(target);

    if (target === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light-theme');
      root.classList.add('dark');
    }

    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [theme, reducedMotion]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('cognitive_theme', mode);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(prev => {
      const next = !prev;
      localStorage.setItem('cognitive_reduced_motion', String(next));
      return next;
    });
  };

  const monacoTheme = effectiveTheme === 'light' ? 'vs' : 'vs-dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        reducedMotion,
        setTheme,
        toggleReducedMotion,
        monacoTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
