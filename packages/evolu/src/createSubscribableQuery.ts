import type { EvoluSchema, Query, QueryRows, Row } from '@evolu/common';
import type { Subscribable } from '@minimalist-apps/connect';
import type { EnsureEvoluStorageDep } from './createEnsureEvoluStorage';
import type { EvoluStorage } from './EvoluStorage';

/**
 * Create a `Subscribable` query that defers Evolu initialization until
 * a component subscribes (mounts). This ensures `ensureEvolu()` is not
 * called at composition root time — only when the UI actually needs data.
 */
export const createSubscribableQuery = <S extends EvoluSchema, R extends Row, MappedRow>(
    deps: EnsureEvoluStorageDep<S>,
    queryFactory: (storage: EvoluStorage<S>) => Query<S, R>,

    // Todo: This breaks the reference identity, mapping creates new objects triggering more updates.
    mapRows: (rows: QueryRows<R>) => ReadonlyArray<MappedRow>,
): Subscribable<ReadonlyArray<MappedRow>> => {
    let rows: ReadonlyArray<MappedRow> = [];
    let evoluUnsubscribe: (() => void) | null = null;
    let ownerChangeUnsubscribe: (() => void) | null = null;
    let bindingVersion = 0;
    let isInitializing = false;
    const listeners = new Set<() => void>();

    const notifyListeners = () => {
        for (const listener of listeners) {
            listener();
        }
    };

    const initialize = () => {
        if (isInitializing || ownerChangeUnsubscribe !== null) {
            return;
        }

        isInitializing = true;

        void deps
            .ensureEvoluStorage()
            .then(storage => {
                const bindActiveOwner = () => {
                    bindingVersion += 1;
                    const currentBindingVersion = bindingVersion;
                    const evolu = storage.evolu;
                    const query = queryFactory(storage);

                    const refreshRows = () => {
                        if (currentBindingVersion !== bindingVersion) {
                            return;
                        }

                        rows = mapRows(evolu.getQueryRows(query));
                        notifyListeners();
                    };

                    evoluUnsubscribe?.();
                    evoluUnsubscribe = evolu.subscribeQuery(query)(refreshRows);
                    refreshRows();

                    void evolu.loadQuery(query).then(refreshRows);
                };

                ownerChangeUnsubscribe = storage.subscribeOwnerChange(bindActiveOwner);
                bindActiveOwner();
            })
            .finally(() => {
                isInitializing = false;
            });
    };

    return {
        subscribe: listener => {
            listeners.add(listener);
            initialize();

            return () => {
                listeners.delete(listener);
            };
        },
        getState: () => {
            initialize();

            return rows;
        },
    };
};
