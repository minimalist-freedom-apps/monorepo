import type { Theme } from '@minimalist-apps/components';

export type Screen = 'Game' | 'Settings';

export interface State {
    readonly themeMode: Theme;
    readonly currentScreen: Screen;
}

export const selectThemeMode = (state: State): Theme => state.themeMode;
export const selectCurrentScreen = (state: State): Screen => state.currentScreen;
