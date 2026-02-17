import type { Theme } from '@minimalist-apps/components';
import type { AppStoreDep } from './createAppStore';

export type SetThemeMode = (themeMode: Theme) => void;

export type SetThemeModeDep = {
    readonly setThemeMode: SetThemeMode;
};

export const createSetThemeMode =
    (deps: AppStoreDep): SetThemeMode =>
    (themeMode): void => {
        deps.store.setState({ themeMode });
    };
