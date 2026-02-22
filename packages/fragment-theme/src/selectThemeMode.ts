import type { Theme } from '@minimalist-apps/components';
import type { ThemeState } from './themeState';

export const selectThemeMode = (state: ThemeState): Theme => state.themeMode;
