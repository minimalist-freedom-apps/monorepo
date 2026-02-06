import { SettingsRow, Switch, type Theme } from '@minimalistic-apps/components';
import type { FC } from 'react';
import type { SetThemeDep } from '../../state/setTheme';

export type ThemeSettingsStateProps = {
    readonly theme: Theme;
};

export type ThemeSettingsDep = {
    ThemeSettings: FC;
};

export const ThemeSettingsPure = (
    deps: SetThemeDep,
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
