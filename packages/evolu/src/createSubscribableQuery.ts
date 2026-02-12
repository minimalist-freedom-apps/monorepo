import type { EvoluSchema, Query, Row } from '@evolu/common';
import type { Subscribable } from '@minimalist-apps/connect';
import type { EnsureEvoluDep } from './createEnsureEvoluStorage';

/**
 * Create a `Subscribable` query that defers Evolu initialization until
 * a component subscribes (mounts). This ensures `ensureEvolu()` is not
 * called at composition root time — only when the UI actually needs data.
 */
export const createSubscribableQuery = <S extends EvoluSchema, R extends Row, MappedRow>(
    deps: EnsureEvoluDep<S>,
    query: Query<R>,
    mapRows: (rows: ReadonlyArray<R>) => ReadonlyArray<MappedRow>,
): Subscribable<ReadonlyArray<MappedRow>> => ({
    subscribe: listener => {
        const { evolu } = deps.ensureEvoluStorage();
        const unsubscribe = evolu.subscribeQuery(query)(listener);

        // Trigger the initial load. When the promise resolves, call
        // the listener so useSyncExternalStore re-reads getQueryRows.
        evolu.loadQuery(query).then(listener);

        return unsubscribe;
    },
    getState: () => {
        const { evolu } = deps.ensureEvoluStorage();

        return mapRows(evolu.getQueryRows(query));
    },
});
