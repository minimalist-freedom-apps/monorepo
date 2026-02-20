import { SettingsRow, Switch } from '@minimalist-apps/components';
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
    <>
        <SettingsRow label="2 Players Mode">
            <Switch
                disabled
                checked={gameMode === 'human'}
                onChange={() => {
                    deps.setGameMode(gameMode === 'human' ? 'bot' : 'human');
                }}
            />
        </SettingsRow>
    </>
);
