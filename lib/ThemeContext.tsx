import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, Theme } from './theme';

type ThemePref = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const PREF_KEY = '@todoapp/theme_pref';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>('system');

  useEffect(() => {
    AsyncStorage.getItem(PREF_KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setPrefState(v);
    });
  }, []);

  const setPref = (p: ThemePref) => {
    setPrefState(p);
    AsyncStorage.setItem(PREF_KEY, p);
  };

  const resolved = pref === 'system' ? (system ?? 'light') : pref;
  const theme = resolved === 'dark' ? darkTheme : lightTheme;

  const value = useMemo(() => ({ theme, pref, setPref }), [theme, pref]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}
