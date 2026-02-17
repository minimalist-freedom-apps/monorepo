import type { BotLevel, GameStore } from './createGameStore';

export type SetBotLevel = (level: BotLevel) => void;

export type SetBotLevelDeps = {
    readonly setBotLevel: SetBotLevel;
};

interface CreateSetBotLevelDeps {
    readonly gameStore: GameStore;
}

export const createSetBotLevel =
    (deps: CreateSetBotLevelDeps): SetBotLevel =>
    level => {
        deps.gameStore.setBotLevel(level);
    };
