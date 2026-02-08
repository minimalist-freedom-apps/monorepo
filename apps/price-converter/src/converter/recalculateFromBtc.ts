import { satsToBtc } from '@minimalist-apps/bitcoin';
import type { StoreDep } from '../state/createStore';
import type { GetSelectedCurrenciesDep } from '../state/evolu/getSelectedCurrencies';
import type { CurrencyValues } from '../state/State';
import { bitcoinToFiat } from './bitcoinToFiat';

export type RecalculateFromBtc = () => Promise<void>;

export interface RecalculateFromBtcDep {
    readonly recalculateFromBtc: RecalculateFromBtc;
}

type RecalculateFromBtcDeps = StoreDep & GetSelectedCurrenciesDep;

export const createRecalculateFromBtc =
    (deps: RecalculateFromBtcDeps): RecalculateFromBtc =>
    async () => {
        const { rates, satsAmount } = deps.store.getState();

        const btcAmount = satsToBtc(satsAmount);
        const currencies = await deps.getSelectedCurrencies.get();

        deps.store.setState({
            fiatAmounts: currencies.reduce<CurrencyValues>((acc, code) => {
                if (rates[code] !== undefined) {
                    acc[code] = bitcoinToFiat(btcAmount, rates[code].rate);
                }

                return acc;
            }, {}),
        });
    };
