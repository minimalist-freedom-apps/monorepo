import { type CurrencyCode, getOrThrow } from '@evolu/common';
import { AmountBtc } from '@minimalistic-apps/bitcoin';
import { formatFiatWithCommas } from '@minimalistic-apps/fiat';
import { parseFormattedNumber } from '@minimalistic-apps/utils';
import type { CurrencyMap } from '../rates/FetchRates';
import type { StoreDep } from '../state/createStore';
import { bitcoinToFiat } from './bitcoinToFiat';

export interface RecalculateFromBtcParams {
    readonly value: string;
    readonly rates?: CurrencyMap;
}

export type RecalculateFromBtc = (params: RecalculateFromBtcParams) => void;

export interface RecalculateFromBtcDep {
    readonly recalculateFromBtc: RecalculateFromBtc;
}

type RecalculateFromBtcDeps = StoreDep;

export const createRecalculateFromBtc =
    (deps: RecalculateFromBtcDeps): RecalculateFromBtc =>
    ({ value, rates: currentRates }) => {
        const { rates, selectedFiatCurrencies: selectedCurrencies } =
            deps.store.getState();
        const usedRates = currentRates ?? rates;
        const btcAmount = getOrThrow(
            AmountBtc.from(parseFormattedNumber(value)),
        );

        if (Number.isNaN(btcAmount) || btcAmount === 0) {
            deps.store.setState({
                selectedFiatCurrenciesInputAmounts: {} as Record<
                    CurrencyCode,
                    string
                >,
            });

            return;
        }

        const newValues = selectedCurrencies.reduce<
            Record<CurrencyCode, string>
        >(
            (acc, code) => {
                if (usedRates[code]) {
                    const fiatAmount = bitcoinToFiat(
                        btcAmount,
                        usedRates[code].rate,
                    );
                    acc[code] = formatFiatWithCommas(fiatAmount);
                }

                return acc;
            },
            {} as Record<CurrencyCode, string>,
        );
        deps.store.setState({ selectedFiatCurrenciesInputAmounts: newValues });
    };
