import { sqliteTrue } from '@evolu/common';
import type { AppEvolu } from './schema';

export const allSelectedCurrenciesQuery = (evolu: AppEvolu) =>
    evolu.evolu.createQuery(db =>
        db
            .selectFrom('currency')
            .select(['id', 'currency', 'order'])
            .where('isDeleted', 'is not', sqliteTrue)
            .where('ownerId', '=', evolu.shardOwner.id),
    );
