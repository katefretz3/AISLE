// Light, dark, or follow the phone.
//
// The choice is a per-device convenience, so it lives in localStorage rather
// than in the household file. index.html applies it before the first paint so
// the app never flashes the wrong theme; this module keeps it current after
// that: on a change in Account, and when the system switches while "System" is
// selected.
import {useEffect, useState} from 'react';
import {Capacitor} from '@capacitor/core';
import {StatusBar, Style} from '@capacitor/status-bar';

export type Appearance = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

const KEY = 'aisle.appearance';
/** The page background in each theme, for the status bar and theme-color. */
const CHROME: Record<Theme, string> = {light: '#f6f8f4', dark: '#0e1513'};

export function readAppearance(): Appearance {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

const systemDark = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;

export const resolveTheme = (a: Appearance): Theme =>
  a === 'dark' || (a === 'system' && systemDark()) ? 'dark' : 'light';

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', CHROME[theme]);
  if (Capacitor.isNativePlatform()) {
    // Style.Dark means light text, for a dark background.
    void StatusBar.setStyle({style: theme === 'dark' ? Style.Dark : Style.Light}).catch(() => {});
    if (Capacitor.getPlatform() === 'android')
      void StatusBar.setBackgroundColor({color: CHROME[theme]}).catch(() => {});
  }
}

export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(readAppearance);
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(readAppearance()));

  useEffect(() => {
    const update = () => {
      const next = resolveTheme(appearance);
      setTheme(next);
      applyTheme(next);
    };
    update();
    if (appearance !== 'system' || typeof matchMedia !== 'function') return;
    const query = matchMedia('(prefers-color-scheme: dark)');
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [appearance]);

  const choose = (next: Appearance) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* not remembered, but still applied for this session */
    }
    setAppearance(next);
  };

  return {appearance, theme, choose};
}
