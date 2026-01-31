import type { CurrencyCode } from '@evolu/common';
import { satsToBtc } from '@minimalistic-apps/bitcoin';
import { bitcoinToFiat } from '../converter/bitcoinToFiat';
import type { StoreDep } from './createStore';

export interface AddCurrencyParams {
    readonly code: CurrencyCode;
}

export type AddCurrency = (params: AddCurrencyParams) => void;

export interface AddCurrencyDep {
    readonly addCurrency: AddCurrency;
}

type AddCurrencyDeps = StoreDep;

export const createAddCurrency =
    (deps: AddCurrencyDeps): AddCurrency =>
    ({ code }) => {
        const {
            selectedFiatCurrencies,
            selectedFiatCurrenciesAmounts,
            satsAmount,
            rates,
        } = deps.store.getState();

        if (rates[code] === undefined) {
            return;
        }

        const btcAmount = satsToBtc(satsAmount);

        deps.store.setState({
            selectedFiatCurrencies: [...selectedFiatCurrencies, code],
            selectedFiatCurrenciesAmounts: {
                ...selectedFiatCurrenciesAmounts,
                [code]: bitcoinToFiat(btcAmount, rates[code].rate),
            },
        });
    };
