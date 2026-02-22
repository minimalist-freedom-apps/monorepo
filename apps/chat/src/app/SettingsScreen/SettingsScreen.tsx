import { SettingsScreenPure as SharedSettingsScreenPure } from '@minimalist-apps/fragment-settings';
import type { ThemeModeSettingsDep } from '@minimalist-apps/fragment-theme';

type SettingsScreenDeps = ThemeModeSettingsDep & {
    readonly onBack: () => void;
};

export const SettingsScreenPure = (deps: SettingsScreenDeps) => (
    <SharedSettingsScreenPure onBack={deps.onBack}>
        <deps.ThemeModeSettings />
    </SharedSettingsScreenPure>
);
