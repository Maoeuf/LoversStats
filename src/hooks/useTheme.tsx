
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'love' | 'dark' | 'light' | 'spotify';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'love';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    // Supprimer toutes les classes de thème existantes
    document.documentElement.classList.remove('theme-love', 'theme-dark', 'theme-light', 'theme-spotify');
    // Ajouter la nouvelle classe de thème
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
