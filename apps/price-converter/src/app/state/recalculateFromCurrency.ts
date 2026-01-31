import {
    btcToSats,
    formatBtcWithCommas,
    formatSats,
} from '@minimalistic-apps/bitcoin';
import {
    formatFiatWithCommas,
    parseFormattedNumber,
} from '@minimalistic-apps/utils';
import type { CurrencyCode } from '../../rates/FetchRates';
import type { CurrencyValues, State } from './State';

export interface RecalculateFromCurrencyParams {
    readonly code: CurrencyCode;
    readonly value: string;
}

export type RecalculateFromCurrency = (
    params: RecalculateFromCurrencyParams,
) => void;

export interface RecalculateFromCurrencyDep {
    readonly recalculateFromCurrency: RecalculateFromCurrency;
}

export interface RecalculateFromCurrencyDeps {
    readonly setState: (partial: Partial<State>) => void;
    readonly getState: () => State;
}

export const createRecalculateFromCurrency =
    (deps: RecalculateFromCurrencyDeps): RecalculateFromCurrency =>
    ({ code, value }) => {
        const { rates, selectedCurrencies, mode } = deps.getState();
        const fiatAmount = parseFormattedNumber(value);

        if (Number.isNaN(fiatAmount) || fiatAmount === 0 || !rates[code]) {
            deps.setState({ btcValue: '', currencyValues: {} });

            return;
        }

        const btcAmount = fiatAmount * rates[code].rate;
        const formattedBtc =
            mode === 'BTC'
                ? formatBtcWithCommas(btcAmount)
                : formatSats(btcToSats(btcAmount));

        const newValues = selectedCurrencies.reduce<CurrencyValues>(
            (acc, otherCode) => {
                if (otherCode !== code && rates[otherCode]) {
                    const otherFiatAmount = btcAmount / rates[otherCode].rate;
                    acc[otherCode] = formatFiatWithCommas(otherFiatAmount);
                } else if (otherCode === code) {
                    acc[otherCode] = value;
                }
                return acc;
            },
            {},
        );

        deps.setState({ btcValue: formattedBtc, currencyValues: newValues });
    };
