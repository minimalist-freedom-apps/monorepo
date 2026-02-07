import { type CurrencyCode, createIdFromString } from '@evolu/common';
import { satsToBtc } from '@minimalistic-apps/bitcoin';
import { bitcoinToFiat } from '../converter/bitcoinToFiat';
import type { StoreDep } from './createStore';
import type { EnsureEvoluDep } from './evolu/schema';

export interface AddCurrencyParams {
    readonly code: CurrencyCode;
}

export type AddCurrency = (params: AddCurrencyParams) => void;

export interface AddCurrencyDep {
    readonly addCurrency: AddCurrency;
}

type AddCurrencyDeps = StoreDep & EnsureEvoluDep;

export const createAddCurrency =
    (deps: AddCurrencyDeps): AddCurrency =>
    ({ code }) => {
        const { fiatAmounts, satsAmount, rates } = deps.store.getState();

        if (rates[code] === undefined) {
            return;
        }

        const btcAmount = satsToBtc(satsAmount);

        // Upsert currency into Evolu (will insert if not exists, update if exists)
        const { evolu, shardOwner } = deps.ensureEvolu();
        evolu.upsert(
            'currency',
            {
                id: createIdFromString<'CurrencyId'>(code),
                currency: code,
            },
            { ownerId: shardOwner.id },
        );

        deps.store.setState({
            fiatAmounts: {
                ...fiatAmounts,
                [code]: bitcoinToFiat(btcAmount, rates[code].rate),
            },
        });
    };
