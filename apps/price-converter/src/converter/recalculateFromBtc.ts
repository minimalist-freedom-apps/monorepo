import { satsToBtc } from '@minimalistic-apps/bitcoin';
import type { CurrencyValues } from '../state/State';
import type { StoreDep } from '../state/createStore';
import { bitcoinToFiat } from './bitcoinToFiat';

export type RecalculateFromBtc = () => void;

export interface RecalculateFromBtcDep {
    readonly recalculateFromBtc: RecalculateFromBtc;
}

type RecalculateFromBtcDeps = StoreDep;

export const createRecalculateFromBtc =
    (deps: RecalculateFromBtcDeps): RecalculateFromBtc =>
    () => {
        const { rates, selectedFiatCurrencies, satsAmount } =
            deps.store.getState();

        const btcAmount = satsToBtc(satsAmount);

        deps.store.setState({
            selectedFiatCurrenciesAmounts:
                selectedFiatCurrencies.reduce<CurrencyValues>((acc, code) => {
                    if (rates[code] !== undefined) {
                        acc[code] = bitcoinToFiat(btcAmount, rates[code].rate);
                    }

                    return acc;
                }, {}),
        });
    };
