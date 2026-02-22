import type { Theme } from '@minimalist-apps/components';
import type { Store } from '@minimalist-apps/mini-store';

export interface ThemeState {
    readonly themeMode: Theme;
}

export type ThemeStoreDep = {
    readonly store: Store<ThemeState>;
};
