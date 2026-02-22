import type { CurrencyCode } from '@evolu/common';
import { btcToSats } from '@minimalist-apps/bitcoin';
import type { FiatAmount } from '@minimalist-apps/fiat';
import type { AppStoreDep } from '../state/createAppStore';
import { fiatToBitcoin } from './fiatToBitcoin';
import type { RecalculateFromBtcDep } from './recalculateFromBtc';

export interface RecalculateFromCurrencyParams {
    readonly code: CurrencyCode;
    readonly value: FiatAmount<CurrencyCode>;
}

export type RecalculateFromCurrency = (params: RecalculateFromCurrencyParams) => void;

export interface RecalculateFromCurrencyDep {
    readonly recalculateFromCurrency: RecalculateFromCurrency;
}

type RecalculateFromCurrencyDeps = AppStoreDep & RecalculateFromBtcDep;

export const createRecalculateFromCurrency =
    (deps: RecalculateFromCurrencyDeps): RecalculateFromCurrency =>
    ({ code, value }) => {
        const { rates } = deps.appStore.getState();

        if (rates[code] === undefined) {
            return;
        }

        const newBtcValue = fiatToBitcoin(value, rates[code].rate);
        deps.appStore.setState({ satsAmount: btcToSats(newBtcValue) });

        deps.recalculateFromBtc();
    };
