import { SettingsRow, Switch, type Theme } from '@minimalistic-apps/components';
import type React from 'react';

export type ThemeSettingsStateProps = {
    readonly theme: Theme;
};

type ThemeSettingsDeps = {
    readonly setTheme: (theme: Theme) => void;
};

type ThemeSettings = React.FC;

export type ThemeSettingsDep = {
    ThemeSettings: ThemeSettings;
};

export const themeSettingsPure = (
    deps: ThemeSettingsDeps,
    { theme }: ThemeSettingsStateProps,
): React.ReactNode => {
    const onThemeToggle = (checked: boolean) => {
        deps.setTheme(checked ? 'light' : 'dark');
    };

    return (
        <SettingsRow label="Theme Mode">
            <Switch checked={theme === 'light'} onChange={onThemeToggle} />
        </SettingsRow>
    );
};
