import { Column } from '@minimalist-apps/components';
import type { BoardSizeSettingsDep } from './BoardSizeSettings';
import type { GameModeSettingsDep } from './GameModeSettings';
import type { ThemeModeSettingsDep } from './ThemeModeSettings';

type SettingsScreenDeps = ThemeModeSettingsDep & GameModeSettingsDep & BoardSizeSettingsDep;

export const SettingsScreenPure = (deps: SettingsScreenDeps) => (
    <Column gap={12}>
        <deps.ThemeModeSettings />
        <deps.GameModeSettings />
        <deps.BoardSizeSettings />
    </Column>
);
