import type { Theme } from '@minimalist-apps/components';
import type { StoreDep } from './createStore';

export type SetTheme = (theme: Theme) => void;

export interface SetThemeDep {
    readonly setTheme: SetTheme;
}

export const createSetTheme =
    (deps: StoreDep): SetTheme =>
    theme =>
        deps.store.setState({ theme });
