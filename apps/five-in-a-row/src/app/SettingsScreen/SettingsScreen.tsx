import { Button, Column } from '@minimalist-apps/components';
import type { BoardSizeSettingsDep } from './BoardSizeSettings';
import type { GameModeSettingsDep } from './GameModeSettings';
import type { ThemeModeSettingsDep } from './ThemeModeSettings';

type SettingsScreenDeps = ThemeModeSettingsDep &
    GameModeSettingsDep &
    BoardSizeSettingsDep & {
        readonly onBack: () => void;
    };

export const SettingsScreenPure = (deps: SettingsScreenDeps) => (
    <Column gap={12}>
        <Button onClick={deps.onBack} variant="text" style={{ alignSelf: 'start' }}>
            ← Back
        </Button>
        <deps.ThemeModeSettings />
        <deps.GameModeSettings />
        <deps.BoardSizeSettings />
    </Column>
);
