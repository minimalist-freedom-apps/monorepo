import type { CurrencyCode } from '@evolu/common';
import { satsToBtc } from '@minimalist-apps/bitcoin';
import type { AppStoreDep } from '../state/createAppStore';
import type { CurrencyValues } from '../state/State';
import { bitcoinToFiat } from './bitcoinToFiat';

export type RecalculateFromBtc = () => void;

export interface RecalculateFromBtcDep {
    readonly recalculateFromBtc: RecalculateFromBtc;
}

/** @publicdep */
export type GetSelectedCurrencyCodesDep = {
    readonly getSelectedCurrencyCodes: () => ReadonlyArray<CurrencyCode>;
};

type RecalculateFromBtcDeps = AppStoreDep & GetSelectedCurrencyCodesDep;

export const createRecalculateFromBtc =
    (deps: RecalculateFromBtcDeps): RecalculateFromBtc =>
    () => {
        const { rates, satsAmount } = deps.appStore.getState();

        const btcAmount = satsToBtc(satsAmount);
        const currencies = deps.getSelectedCurrencyCodes();

        deps.appStore.setState({
            fiatAmounts: currencies.reduce<CurrencyValues>((acc, code) => {
                if (rates[code] !== undefined) {
                    acc[code] = bitcoinToFiat(btcAmount, rates[code].rate);
                }

                return acc;
            }, {}),
        });
    };
