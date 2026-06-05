export const colorTokens = {
  light: {
    background: '210 33% 96%',
    foreground: '222 47% 11%',
    card: '0 0% 100%',
    cardForeground: '222 47% 11%',
    primary: '220 88% 56%',
    primaryForeground: '0 0% 100%',
    secondary: '46 100% 58%',
    secondaryForeground: '222 47% 11%',
    muted: '214 32% 91%',
    mutedForeground: '215 16% 47%',
    destructive: '0 84% 60%',
    destructiveForeground: '210 40% 98%',
    border: '214 32% 88%',
    input: '214 32% 88%',
    ring: '220 88% 56%'
  },
  dark: {
    background: '222 47% 8%',
    foreground: '210 40% 98%',
    card: '222 47% 11%',
    cardForeground: '210 40% 98%',
    primary: '217 91% 60%',
    primaryForeground: '222 47% 11%',
    secondary: '45 96% 55%',
    secondaryForeground: '222 47% 11%',
    muted: '217 33% 18%',
    mutedForeground: '215 20% 72%',
    destructive: '0 72% 51%',
    destructiveForeground: '210 40% 98%',
    border: '217 33% 22%',
    input: '217 33% 22%',
    ring: '217 91% 60%'
  }
} as const;

export type ThemeMode = keyof typeof colorTokens;
