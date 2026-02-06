import { SettingsRow, Switch, type Theme } from '@minimalistic-apps/components';
import type { Connected } from '@minimalistic-apps/mini-store';

export type ThemeSettingsStateProps = {
    readonly theme: Theme;
};

type ThemeSettingsDeps = {
    readonly setTheme: (theme: Theme) => void;
};

export type ThemeSettingsDep = {
    ThemeSettings: Connected;
};

export const ThemeSettingsPure = (
    deps: ThemeSettingsDeps,
    { theme }: ThemeSettingsStateProps,
) => {
    const onThemeToggle = (checked: boolean) => {
        deps.setTheme(checked ? 'light' : 'dark');
    };

    return (
        <SettingsRow label="Theme Mode">
            <Switch checked={theme === 'light'} onChange={onThemeToggle} />
        </SettingsRow>
    );
};
