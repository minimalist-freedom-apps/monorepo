import type { GameState } from '../game';

export interface BotWorkerRequest {
    readonly requestId: number;
    readonly state: GameState;
}

export interface BotWorkerResponse {
    readonly requestId: number;
    readonly move: number | null;
}
