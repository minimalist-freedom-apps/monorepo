import type { Theme } from '@minimalist-apps/components';
import type { StoreDep } from './createStore';

export const createSetThemeMode =
    (deps: StoreDep) =>
    (themeMode: Theme): void => {
        deps.store.setState({ themeMode });
    };
