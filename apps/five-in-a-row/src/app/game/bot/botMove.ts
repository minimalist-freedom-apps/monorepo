import type { GameState } from '../game';
import type { Bot } from './Bot';
import { alphaBetaPruning } from './bots/alphaBeta/alphaBetaPruning';

export const botMove = (state: GameState): number | null => {
    // Currently, we only have one bot implementation,
    // but we can easily add more and select between them here.
    const bot: Bot = alphaBetaPruning;

    return bot(state);
};
