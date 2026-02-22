import { SettingsScreenPure as SharedSettingsScreenPure } from '@minimalist-apps/fragment-settings';
import type { ThemeModeSettingsDep } from '@minimalist-apps/fragment-theme';
import type { BoardSizeSettingsDep } from './BoardSizeSettings';
import type { GameModeSettingsDep } from './GameModeSettings';

type SettingsScreenDeps = ThemeModeSettingsDep &
    GameModeSettingsDep &
    BoardSizeSettingsDep & {
        readonly onBack: () => void;
    };

export const SettingsScreenPure = (deps: SettingsScreenDeps) => (
    <SharedSettingsScreenPure onBack={deps.onBack}>
        <deps.ThemeModeSettings />
        <deps.GameModeSettings />
        <deps.BoardSizeSettings />
    </SharedSettingsScreenPure>
);
