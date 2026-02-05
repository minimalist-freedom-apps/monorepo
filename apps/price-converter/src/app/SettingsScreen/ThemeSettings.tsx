import { SettingsRow, Switch, type Theme } from '@minimalistic-apps/components';
import type { ComponentConnectDep } from '@minimalistic-apps/mini-store';
import type React from 'react';

type ThemeSettingsStateProps = {
    readonly theme: Theme;
};

type ThemeSettingsDeps = ComponentConnectDep<ThemeSettingsStateProps> & {
    readonly setTheme: (theme: Theme) => void;
};

type ThemeSettings = React.FC;

export type ThemeSettingsDep = {
    ThemeSettings: ThemeSettings;
};

export const createThemeSettings = (deps: ThemeSettingsDeps): ThemeSettings =>
    deps.connect(({ theme }) => {
        const onThemeToggle = (checked: boolean) => {
            deps.setTheme(checked ? 'light' : 'dark');
        };

        return (
            <SettingsRow label="Theme Mode">
                <Switch checked={theme === 'light'} onChange={onThemeToggle} />
            </SettingsRow>
        );
    });
