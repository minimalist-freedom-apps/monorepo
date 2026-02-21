import { sqliteTrue } from '@evolu/common';
import type { EvoluStorage } from './schema';

export const allSelectedCurrenciesQuery = (storage: EvoluStorage) =>
    storage.evolu.createQuery(db =>
        db
            .selectFrom('currency')
            .select(['id', 'currency', 'order'])
            .where('isDeleted', 'is not', sqliteTrue)
            .where('ownerId', '=', storage.activeOwner.id),
    );
