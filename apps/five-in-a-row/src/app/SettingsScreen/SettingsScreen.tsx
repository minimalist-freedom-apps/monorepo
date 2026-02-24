import { SettingsScreen } from '@minimalist-apps/fragment-settings';
import type { ThemeModeSettingsDep } from '@minimalist-apps/fragment-theme';
import type { GoBackDep } from '@minimalist-apps/navigator';
import type { BoardSizeSettingsDep } from './BoardSizeSettings';
import type { GameModeSettingsDep } from './GameModeSettings';

type SettingsScreenDeps = ThemeModeSettingsDep &
    GameModeSettingsDep &
    BoardSizeSettingsDep &
    GoBackDep;

export const SettingsScreenPure = (deps: SettingsScreenDeps) => (
    <SettingsScreen goBack={deps.goBack}>
        <deps.ThemeModeSettings />
        <deps.GameModeSettings />
        <deps.BoardSizeSettings />
    </SettingsScreen>
);
