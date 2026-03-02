import { createQueryBuilder, sqliteTrue } from '@evolu/common';
import { type EvoluStorage, Schema } from './schema';

const createQuery = createQueryBuilder(Schema);

export const allSelectedCurrenciesQuery = (storage: EvoluStorage) =>
    createQuery(db =>
        db
            .selectFrom('currency')
            .select(['id', 'currency', 'order'])
            .where('isDeleted', 'is not', sqliteTrue)
            .where('ownerId', '=', storage.activeOwner.id),
    );
