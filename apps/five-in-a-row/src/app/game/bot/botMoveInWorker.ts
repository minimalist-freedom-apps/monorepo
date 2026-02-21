import type { GameState } from '../game';
import type { BotWorkerRequest, BotWorkerResponse } from './botWorkerProtocol';

interface BotMoveInWorkerProps {
    readonly state: GameState;
}

interface PendingRequest {
    readonly resolve: (value: number | null) => void;
    readonly reject: (reason: Error) => void;
}

let requestId = 0;
const pendingRequests = new Map<number, PendingRequest>();

const worker = new Worker(new URL('./botWorker.ts', import.meta.url), { type: 'module' });

worker.onmessage = (event: MessageEvent<BotWorkerResponse>) => {
    const { requestId: responseId, move } = event.data;
    const pendingRequest = pendingRequests.get(responseId);

    if (pendingRequest === undefined) {
        return;
    }

    pendingRequests.delete(responseId);
    pendingRequest.resolve(move);
};

worker.onerror = () => {
    const error = new Error('Bot worker failed.');

    for (const [id, pendingRequest] of pendingRequests) {
        pendingRequest.reject(error);
        pendingRequests.delete(id);
    }
};

export const botMoveInWorker = ({ state }: BotMoveInWorkerProps): Promise<number | null> => {
    requestId += 1;
    const currentRequestId = requestId;

    return new Promise((resolve, reject) => {
        pendingRequests.set(currentRequestId, { resolve, reject });

        const request: BotWorkerRequest = {
            requestId: currentRequestId,
            state,
        };

        worker.postMessage(request);
    });
};
