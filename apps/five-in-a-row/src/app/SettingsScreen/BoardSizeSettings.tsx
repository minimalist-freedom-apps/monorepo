import { Column, SettingsRow, Slider, Text } from '@minimalist-apps/components';
import type { GameMode } from '../game/store/createGameStore';
import type { SetBoardSizeDeps } from '../game/store/setBoardSize';

const minBoardSize = 3;
const maxBoardSize = 30;
const maxBotBoardSize = 15;

export interface BoardSizeSettingsStateProps {
    readonly boardSize: number;
    readonly gameMode: GameMode;
}

export type BoardSizeSettingsDeps = SetBoardSizeDeps;

export const BoardSizeSettingsPure = (
    deps: BoardSizeSettingsDeps,
    { boardSize, gameMode }: BoardSizeSettingsStateProps,
) => (
    <SettingsRow label="Board Size" direction="column">
        <Column gap={8}>
            <Slider
                min={minBoardSize}
                max={gameMode === 'bot' ? maxBotBoardSize : maxBoardSize}
                value={boardSize}
                onChange={deps.setBoardSize}
            />
            <Text>{`${boardSize} × ${boardSize}`}</Text>
            {gameMode === 'bot' ? <Text>Bot mode supports up to 15 × 15.</Text> : null}
        </Column>
    </SettingsRow>
);
