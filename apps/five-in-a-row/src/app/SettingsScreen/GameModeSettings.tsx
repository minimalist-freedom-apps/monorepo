import { Button, Row, SettingsRow, Switch } from '@minimalist-apps/components';
import type { BotLevel, GameMode } from '../game/store/createGameStore';
import type { SetBotLevelDeps } from '../game/store/setBotLevel';
import type { SetGameModeDeps } from '../game/store/setGameMode';

const botLevels: ReadonlyArray<BotLevel> = ['Easy', 'Medium', 'Hard', 'Torment', 'Impossible'];

export interface GameModeSettingsStateProps {
    readonly gameMode: GameMode;
    readonly botLevel: BotLevel;
}

export type GameModeSettingsDeps = SetGameModeDeps & SetBotLevelDeps;

export const GameModeSettingsPure = (
    deps: GameModeSettingsDeps,
    { gameMode, botLevel }: GameModeSettingsStateProps,
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
        {gameMode === 'bot' ? (
            <SettingsRow label="Bot Difficulty" direction="column">
                <Row gap={8} wrap>
                    {botLevels.map(level => (
                        <Button
                            disabled
                            key={level}
                            variant={botLevel === level ? 'default' : 'text'}
                            onClick={() => deps.setBotLevel(level)}
                        >
                            {level}
                        </Button>
                    ))}
                </Row>
            </SettingsRow>
        ) : null}
    </>
);
