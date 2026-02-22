import type { Theme } from '@minimalist-apps/components';
import type { ThemeStoreDep } from './themeState';

export type SetThemeMode = (themeMode: Theme) => void;

export type SetThemeModeDep = {
    readonly setThemeMode: SetThemeMode;
};

export const createSetThemeMode =
    (deps: ThemeStoreDep): SetThemeMode =>
    (themeMode): void => {
        deps.store.setState({ themeMode });
    };
