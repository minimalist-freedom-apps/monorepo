import {
    type CurrencyCode,
    createIdFromString,
    sqliteTrue,
} from '@evolu/common';
import type { EnsureEvoluDep } from '../../../../packages/evolu/src/createEnsureEvolu';
import type { RemoveFiatAmountDep } from '../state/removeFiatAmount';

export interface RemoveCurrencyParams {
    readonly code: CurrencyCode;
}

export type RemoveCurrency = (params: RemoveCurrencyParams) => void;

export interface RemoveCurrencyDep {
    readonly removeCurrency: RemoveCurrency;
}

type RemoveCurrencyDeps = EnsureEvoluDep & RemoveFiatAmountDep;

export const createRemoveCurrency =
    (deps: RemoveCurrencyDeps): RemoveCurrency =>
    ({ code }) => {
        const { evolu, shardOwner } = deps.ensureEvolu();
        evolu.upsert(
            'currency',
            {
                id: createIdFromString<'CurrencyId'>(code),
                currency: code,
                isDeleted: sqliteTrue,
            },
            { ownerId: shardOwner.id },
        );

        deps.removeFiatAmount(code);
    };
