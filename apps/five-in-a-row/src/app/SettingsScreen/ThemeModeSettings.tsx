import { SettingsRow, Switch, type Theme } from '@minimalist-apps/components';
import type { SetThemeModeDep } from '../../appStore/setThemeMode';

export interface ThemeModeSettingsStateProps {
    readonly themeMode: Theme;
}

export type ThemeModeSettingsDeps = SetThemeModeDep;

export const ThemeModeSettingsPure = (
    deps: ThemeModeSettingsDeps,
    { themeMode }: ThemeModeSettingsStateProps,
) => (
    <SettingsRow label="Theme Mode">
        <Switch
            checked={themeMode === 'light'}
            onChange={() => deps.setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
        />
    </SettingsRow>
);
