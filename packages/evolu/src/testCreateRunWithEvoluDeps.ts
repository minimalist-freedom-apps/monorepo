import {
    type CreateSqliteDriver,
    type CreateSqliteDriverDep,
    constVoid,
    createConsoleStoreOutput,
    createPreparedStatementsCache,
    ok,
    type SqliteDriver,
    type SqliteRow,
    testCreateBroadcastChannel,
    testCreateLockManager,
    testCreateMessageChannel,
    testCreateMessagePort,
    testCreateRun,
    testCreateSharedWorker,
    testCreateWebSocket,
    testCreateWorker,
} from '@evolu/common';
import {
    type DbWorkerInit,
    initSharedWorker,
    type SharedWorkerInput,
    type SharedWorkerOutput,
    startDbWorker,
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
        constVoid,
    );

    const dispose = () => {
        if (isDisposed) {
            return;
        }

        isDisposed = true;
        cache[Symbol.dispose]();
        db.close();
    };

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
        deleteDatabase: dispose,
        [Symbol.dispose]: dispose,
    };

    return ok(driver);
};

const testCreateSqliteDeps: CreateSqliteDriverDep = {
    createSqliteDriver: name => createBetterSqliteDriver(name, { mode: 'memory' }),
};

export const testCreateRunWithEvoluDeps = () => {
    const consoleStoreOutput = createConsoleStoreOutput();
    const sharedWorker = testCreateSharedWorker<SharedWorkerInput, SharedWorkerOutput>();

    const run = testCreateRun({
        consoleStoreOutputEntry: consoleStoreOutput.entry,
        createBroadcastChannel: testCreateBroadcastChannel,
        createMessageChannel: testCreateMessageChannel,
        createMessagePort: testCreateMessagePort,
        createWebSocket: testCreateWebSocket({ throwOnCreate: true }),
        createDbWorker: () => {
            const worker = testCreateWorker<DbWorkerInit>();
            void run(startDbWorker(worker.self));

            return worker;
        },
        createSqliteDriver: testCreateSqliteDeps.createSqliteDriver,
        lockManager: testCreateLockManager(),
        reloadApp: constVoid,
        sharedWorker,
    });

    void run(initSharedWorker(sharedWorker.self));
    sharedWorker.connect();

    return run;
};
