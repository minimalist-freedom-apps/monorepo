/// <reference lib="webworker" />

import { botMove } from './botMove';
import type { BotWorkerRequest, BotWorkerResponse } from './botWorkerProtocol';

const workerScope = self as DedicatedWorkerGlobalScope;

workerScope.onmessage = (event: MessageEvent<BotWorkerRequest>) => {
    const { requestId, state } = event.data;
    const move = botMove(state);
    const response: BotWorkerResponse = {
        requestId,
        move,
    };

    workerScope.postMessage(response);
};
