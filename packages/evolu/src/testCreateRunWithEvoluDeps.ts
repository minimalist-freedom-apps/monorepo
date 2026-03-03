 

import {
    type CreateSqliteDriver,
    type CreateSqliteDriverDep,
    createConsoleStoreOutput,
    createInMemoryLeaderLock,
    createMessageChannel,
    createMessagePort,
    createPreparedStatementsCache,
    createSharedWorker,
    createSqlite,
    createWorker,
    lazyVoid,
    ok,
    type SqliteDriver,
    type SqliteRow,
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
import BetterSQLite, { type Statement } from 'better-sqlite3';

// Duplicated from @evolu/nodejs because @evolu/common cannot depend on it
// (nodejs depends on common — importing back would create a circular dependency).
const createBetterSqliteDriver: CreateSqliteDriver = (name, options) => () => {
    const filename = options?.mode === 'memory' ? ':memory:' : `${name}.db`;
    const db = new BetterSQLite(filename);
    let isDisposed = false;

    const cache = createPreparedStatementsCache<Statement>(
        sql => db.prepare(sql),
        // Not needed.
        // https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#class-statement
        lazyVoid,
    );

    const driver: SqliteDriver = {
        exec: query => {
            // Always prepare is recommended for better-sqlite3
            const prepared = cache.get(query, true);

            if (prepared.reader) {
                const rows = prepared.all(query.parameters) as Array<SqliteRow>;

                return { rows, changes: 0 };
            }

            const changes = prepared.run(query.parameters).changes;

            return { rows: [], changes };
        },

        export: () => {
            const file = db.serialize();
            const { buffer } = file;

            if (buffer instanceof ArrayBuffer) {
                return new Uint8Array(buffer, file.byteOffset, file.byteLength);
            }

            // Ensure export uses transferable ArrayBuffer backing.
            return new Uint8Array(file);
        },

        [Symbol.dispose]: () => {
            if (isDisposed) {
                return;
            }

            isDisposed = true;
            cache[Symbol.dispose]();
            db.close();
        },
    };

    return ok(driver);
};

export const testCreateSqliteDeps: CreateSqliteDriverDep = {
    createSqliteDriver: name => createBetterSqliteDriver(name, { mode: 'memory' }),
};

export const testCreateRunWithEvoluDeps = async () => {
    const consoleStoreOutput = createConsoleStoreOutput();

    const run = testCreateRun({
        // console: createConsole({ level: "debug" }),
        consoleStoreOutputEntry: consoleStoreOutput.entry,
        createMessageChannel,
        createMessagePort,
        createWebSocket: testCreateWebSocket({ throwOnCreate: true }),
    });

    const driver = await run.orThrow(testCreateSqliteDeps.createSqliteDriver(testName));

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

    const sqlite = await workerRun.orThrow(createSqlite(testName));

    return run.addDeps({
        createDbWorker,
        reloadApp: lazyVoid,
        sharedWorker,
        sqlite,
    });
};
