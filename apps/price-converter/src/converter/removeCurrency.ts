import { type CurrencyCode, createIdFromString, sqliteTrue } from '@evolu/common';
import type { EnsureEvoluStorageDep } from '../state/evolu/schema';
import type { RemoveFiatAmountDep } from '../state/removeFiatAmount';

export interface RemoveCurrencyParams {
    readonly code: CurrencyCode;
}

export type RemoveCurrency = (params: RemoveCurrencyParams) => Promise<void>;

export interface RemoveCurrencyDep {
    readonly removeCurrency: RemoveCurrency;
}

type RemoveCurrencyDeps = EnsureEvoluStorageDep & RemoveFiatAmountDep;

export const createRemoveCurrency =
    (deps: RemoveCurrencyDeps): RemoveCurrency =>
    async ({ code }) => {
        const { evolu, activeOwner } = await deps.ensureEvoluStorage();
        evolu.upsert(
            'currency',
            {
                id: createIdFromString<'CurrencyId'>(code),
                currency: code,
                isDeleted: sqliteTrue,
            },
            { ownerId: activeOwner.id },
        );

        deps.removeFiatAmount(code);
    };
