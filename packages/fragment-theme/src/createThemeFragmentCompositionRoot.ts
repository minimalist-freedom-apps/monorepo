import type { Connect } from '@minimalist-apps/connect';
import { createSetThemeMode } from './createSetThemeMode';
import { selectThemeMode } from './selectThemeMode';
import { ThemeModeSettingsPure } from './ThemeModeSettings';
import type { ThemeState, ThemeStoreDep } from './themeState';

type ThemeFragmentCompositionRootDeps = ThemeStoreDep & {
    readonly connect: Connect<{ readonly store: ThemeState }>;
};

export const createThemeFragmentCompositionRoot = (deps: ThemeFragmentCompositionRootDeps) => {
    const setThemeMode = createSetThemeMode({ store: deps.store });

    const ThemeModeSettings = deps.connect(
        ThemeModeSettingsPure,
        ({ store }) => ({ themeMode: selectThemeMode(store) }),
        { setThemeMode },
    );

    return { ThemeModeSettings, setThemeMode };
};
