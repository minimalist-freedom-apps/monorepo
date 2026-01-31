import {
    formatFiatWithCommas,
    parseFormattedNumber,
} from '@minimalistic-apps/utils';
import type { CurrencyCode, RatesMap } from '../../rates/FetchRates';
import type { State } from '../state/State';

export interface RecalculateFromBtcParams {
    readonly value: string;
    readonly rates?: RatesMap;
}

export type RecalculateFromBtc = (params: RecalculateFromBtcParams) => void;

export interface RecalculateFromBtcDep {
    readonly recalculateFromBtc: RecalculateFromBtc;
}

export interface RecalculateFromBtcDeps {
    readonly setState: (partial: Partial<State>) => void;
    readonly getState: () => State;
}

export const createRecalculateFromBtc =
    (deps: RecalculateFromBtcDeps): RecalculateFromBtc =>
    ({ value, rates: currentRates }) => {
        const { rates, selectedCurrencies } = deps.getState();
        const usedRates = currentRates ?? rates;
        const btcAmount = parseFormattedNumber(value);

        if (Number.isNaN(btcAmount) || btcAmount === 0) {
            deps.setState({
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
        deps.setState({ currencyValues: newValues });
    };
