import type { Query, QueryRows, Row, StoreSubscribe } from '@evolu/common';
import type { Subscribable } from '@minimalistic-apps/connect';

interface SubscribableQueryDeps {
    readonly subscribeQuery: (query: Query) => StoreSubscribe;
    readonly getQueryRows: <R extends Row>(query: Query<R>) => QueryRows<R>;
}

export const createSubscribableQuery = <R extends Row>(
    deps: SubscribableQueryDeps,
    query: Query<R>,
): Subscribable<QueryRows<R>> => ({
    subscribe: deps.subscribeQuery(query),
    getState: () => deps.getQueryRows(query),
});
