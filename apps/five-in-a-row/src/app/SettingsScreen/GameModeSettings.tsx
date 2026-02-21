import { Button, Row, SettingsRow } from '@minimalist-apps/components';
import type { FC } from 'react';
import type { GameMode } from '../game/store/createGameStore';
import type { SetGameModeDeps } from '../game/store/setGameMode';

export type GameModeSettingsDep = {
    readonly GameModeSettings: FC;
};

export interface GameModeSettingsStateProps {
    readonly gameMode: GameMode;
}

export type GameModeSettingsDeps = SetGameModeDeps;

export const GameModeSettingsPure = (
    deps: GameModeSettingsDeps,
    { gameMode }: GameModeSettingsStateProps,
) => (
    <SettingsRow label="Game Mode">
        <Row gap={8}>
            <Button
                intent={gameMode === 'human' ? 'primary' : 'secondary'}
                onClick={() => deps.setGameMode('human')}
                size="medium"
            >
                2 payers
            </Button>
            <Button
                intent={gameMode === 'bot' ? 'primary' : 'secondary'}
                onClick={() => deps.setGameMode('bot')}
                size="medium"
            >
                Bot 🤖
            </Button>
        </Row>
    </SettingsRow>
);
