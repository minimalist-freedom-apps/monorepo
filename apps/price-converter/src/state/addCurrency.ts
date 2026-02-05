import {
    type CurrencyCode,
    createIdFromString,
    type Evolu,
} from '@evolu/common';
import { satsToBtc } from '@minimalistic-apps/bitcoin';
import { bitcoinToFiat } from '../converter/bitcoinToFiat';
import type { StoreDep } from './createStore';
import type { Schema } from './evolu/schema';

export interface AddCurrencyParams {
    readonly code: CurrencyCode;
}

export type AddCurrency = (params: AddCurrencyParams) => void;

export interface AddCurrencyDep {
    readonly addCurrency: AddCurrency;
}

export interface EvoluDep {
    readonly evolu: Evolu<typeof Schema>;
}

type AddCurrencyDeps = StoreDep & EvoluDep;

export const createAddCurrency =
    (deps: AddCurrencyDeps): AddCurrency =>
    ({ code }) => {
        const {
            fiatAmounts: selectedFiatCurrenciesAmounts,
            satsAmount,
            rates,
        } = deps.store.getState();

        if (rates[code] === undefined) {
            return;
        }

        const btcAmount = satsToBtc(satsAmount);

        // Upsert currency into Evolu (will insert if not exists, update if exists)
        deps.evolu.upsert('currency', {
            id: createIdFromString<'CurrencyId'>(code),
            currency: code,
        });

        deps.store.setState({
            fiatAmounts: {
                ...selectedFiatCurrenciesAmounts,
                [code]: bitcoinToFiat(btcAmount, rates[code].rate),
            },
        });
    };
