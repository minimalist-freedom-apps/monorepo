import type { Evolu, EvoluSchema, Query, QueryRows, Row } from '@evolu/common';
import type { Subscribable } from '@minimalist-apps/connect';

export const createSubscribableQuery = <S extends EvoluSchema, R extends Row>(
    evolu: Evolu<S>,
    query: Query<R>,
): Subscribable<QueryRows<R>> => ({
    subscribe: evolu.subscribeQuery(query),
    getState: () => evolu.getQueryRows(query),
});
