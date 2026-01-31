import type { CurrencyCode } from '@evolu/common';
import {
    formatFiatWithCommas,
    parseFormattedNumber,
} from '@minimalistic-apps/utils';
import type { RatesMap } from '../rates/FetchRates';
import type { StoreDep } from '../state/createStore';

export interface RecalculateFromBtcParams {
    readonly value: string;
    readonly rates?: RatesMap;
}

export type RecalculateFromBtc = (params: RecalculateFromBtcParams) => void;

export interface RecalculateFromBtcDep {
    readonly recalculateFromBtc: RecalculateFromBtc;
}

type RecalculateFromBtcDeps = StoreDep;

export const createRecalculateFromBtc =
    (deps: RecalculateFromBtcDeps): RecalculateFromBtc =>
    ({ value, rates: currentRates }) => {
        const { rates, selectedCurrencies } = deps.store.getState();
        const usedRates = currentRates ?? rates;
        const btcAmount = parseFormattedNumber(value);

        if (Number.isNaN(btcAmount) || btcAmount === 0) {
            deps.store.setState({
                currencyValues: {} as Record<CurrencyCode, string>,
            });

            return;
        }

        const newValues = selectedCurrencies.reduce<
            Record<CurrencyCode, string>
        >(
            (acc, code) => {
                if (usedRates[code]) {
                    const fiatAmount = btcAmount / usedRates[code].rate;
                    acc[code] = formatFiatWithCommas(fiatAmount);
                }

                return acc;
            },
            {} as Record<CurrencyCode, string>,
        );
        deps.store.setState({ currencyValues: newValues });
    };
