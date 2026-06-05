import { darkTheme } from './dark';
import { lightTheme } from './light';

export const themes = {
  light: lightTheme,
  dark: darkTheme
} as const;

export type AppTheme = keyof typeof themes;
