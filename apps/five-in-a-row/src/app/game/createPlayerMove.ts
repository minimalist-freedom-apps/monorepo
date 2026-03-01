import { botMoveInWorker } from './bot/botMoveInWorker';
import type { GameState } from './game';
import type { GameStoreDep } from './store/createGameStore';
import type { PlayMoveDep } from './store/playMove';

type PlayerMoveParams = {
    readonly index: number;
};

export type PlayerMove = (params: PlayerMoveParams) => void;

export type PlayerMoveDep = {
    readonly playerMove: PlayerMove;
};

/** @publicdep */
export interface ShouldPlayBotDep {
    readonly getShouldPlayBot: () => boolean;
}

/** @publicdep */
export interface CurrentSnapshotDep {
    readonly getCurrentSnapshot: () => GameState;
}

type PlayerMoveDeps = GameStoreDep & PlayMoveDep & ShouldPlayBotDep & CurrentSnapshotDep;

export const createPlayerMove =
    (deps: PlayerMoveDeps): PlayerMove =>
    ({ index }) => {
        deps.playMove({ index });

        const snapshot = deps.getCurrentSnapshot();

        if (deps.getShouldPlayBot() === false) {
            return;
        }

        deps.gameStore.setState({ isBotThinking: true });

        void botMoveInWorker({ state: snapshot })
            .then(botIndex => {
                if (deps.getShouldPlayBot() === false) {
                    return;
                }

                if (botIndex !== null && botIndex !== -1) {
                    deps.playMove({ index: botIndex });
                }
            })
            .finally(() => {
                deps.gameStore.setState({ isBotThinking: false });
            });
    };
