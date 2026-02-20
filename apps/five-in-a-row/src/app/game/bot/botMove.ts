import type { GameState } from '../game';
import type { Bot } from './Bot';
import { alphaBetaPruning } from './bots/alphaBetaPruning';

export const botMove = (state: GameState): number | null => {
    const bot: Bot = alphaBetaPruning;

    return bot(state);
};
