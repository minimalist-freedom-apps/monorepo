import type { CurrencyCode } from '@evolu/common';
import { btcToSats } from '@minimalistic-apps/bitcoin';
import type { FiatAmount } from '@minimalistic-apps/fiat';
import type { StoreDep } from '../state/createStore';
import { fiatToBitcoin } from './fiatToBitcoin';
import type { RecalculateFromBtcDep } from './recalculateFromBtc';

export interface RecalculateFromCurrencyParams {
    readonly code: CurrencyCode;
    readonly value: FiatAmount<CurrencyCode>;
}

export type RecalculateFromCurrency = (
    params: RecalculateFromCurrencyParams,
) => void;

export interface RecalculateFromCurrencyDep {
    readonly recalculateFromCurrency: RecalculateFromCurrency;
}

type RecalculateFromCurrencyDeps = StoreDep & RecalculateFromBtcDep;

export const createRecalculateFromCurrency =
    (deps: RecalculateFromCurrencyDeps): RecalculateFromCurrency =>
    ({ code, value }) => {
        const { rates } = deps.store.getState();

        if (rates[code] === undefined) {
            return;
        }

        const newBtcValue = fiatToBitcoin(value, rates[code].rate);
        deps.store.setState({ satsAmount: btcToSats(newBtcValue) });

        deps.recalculateFromBtc();
    };
