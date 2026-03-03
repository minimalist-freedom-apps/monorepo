import {
    type CreateSqliteDriverDep,
    createConsoleStoreOutput,
    createInMemoryLeaderLock,
    createMessageChannel,
    createMessagePort,
    createSharedWorker,
    createSqlite,
    createWorker,
    lazyVoid,
    ok,
    testCreateRun,
    testCreateWebSocket,
    testName,
} from '@evolu/common';
import {
    type DbWorkerInit,
    initDbWorker,
    initSharedWorker,
    type SharedWorkerInput,
} from '@evolu/common/local-first';
import { createWasmSqliteDriver } from '@evolu/web';

// Source reference:
// https://github.com/evoluhq/evolu/blob/main/packages/common/test/local-first/Evolu.test.ts
export const testCreateSqliteDeps: CreateSqliteDriverDep = {
    createSqliteDriver: (name, options) => createWasmSqliteDriver(name, options),
};

// Source reference:
// https://github.com/evoluhq/evolu/blob/main/packages/common/test/local-first/Evolu.test.ts
export const testCreateRunWithEvoluDeps = async () => {
    const consoleStoreOutput = createConsoleStoreOutput();

    const run = testCreateRun({
        consoleStoreOutputEntry: consoleStoreOutput.entry,
        createMessageChannel,
        createMessagePort,
        createWebSocket: testCreateWebSocket(),
    });

    const driver = await run.orThrow(
        testCreateSqliteDeps.createSqliteDriver(testName, { mode: 'memory' }),
    );

    const workerRun = testCreateRun({
        consoleStoreOutputEntry: consoleStoreOutput.entry,
        createMessagePort,
        leaderLock: createInMemoryLeaderLock(),
        createSqliteDriver: () => () => ok(driver),
    });

    const createDbWorker = () =>
        createWorker<DbWorkerInit>(self => {
            workerRun(initDbWorker(self));
        });

    const sharedWorker = createSharedWorker<SharedWorkerInput>(self => {
        run(initSharedWorker(self));
    });

    const sqlite = await workerRun.orThrow(createSqlite(testName, { mode: 'memory' }));

    return run.addDeps({
        createDbWorker,
        reloadApp: lazyVoid,
        sharedWorker,
        sqlite,
    });
};
