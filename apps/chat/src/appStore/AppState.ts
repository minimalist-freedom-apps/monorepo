import type { Theme } from '@minimalist-apps/components';

export type Screen = 'Chat' | 'Settings';

export interface AppState {
    readonly themeMode: Theme;
    readonly currentScreen: Screen;
}

export const selectThemeMode = (state: AppState): Theme => state.themeMode;
export const selectCurrentScreen = (state: AppState): Screen => state.currentScreen;
