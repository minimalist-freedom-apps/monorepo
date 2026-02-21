import type { Connect } from '@minimalist-apps/connect';
import { createSetThemeMode } from './createSetThemeMode';
import { selectThemeMode } from './selectThemeMode';
import { ThemeModeSettingsPure } from './ThemeModeSettings';
import type { ThemeState, ThemeStoreDep } from './themeState';

type ThemeFragmentCompositionRootDeps<State extends ThemeState> = ThemeStoreDep<State> & {
    readonly connect: Connect<{ readonly store: State }>;
};

export const createThemeFragmentCompositionRoot = <State extends ThemeState>(
    deps: ThemeFragmentCompositionRootDeps<State>,
) => {
    const setThemeMode = createSetThemeMode({ store: deps.store });

    const ThemeModeSettings = deps.connect(
        ThemeModeSettingsPure,
        ({ store }) => ({ themeMode: selectThemeMode(store) }),
        { setThemeMode },
    );

    return { ThemeModeSettings, setThemeMode };
};
