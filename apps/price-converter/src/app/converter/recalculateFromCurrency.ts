import {
    btcToSats,
    formatBtcWithCommas,
    formatSats,
} from '@minimalistic-apps/bitcoin';
import {
    formatFiatWithCommas,
    parseFormattedNumber,
} from '@minimalistic-apps/utils';
import type { StoreDep } from '../../compositionRoot';
import type { CurrencyCode } from '../../rates/FetchRates';
import type { CurrencyValues } from '../state/State';

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

type RecalculateFromCurrencyDeps = StoreDep;

export const createRecalculateFromCurrency =
    (deps: RecalculateFromCurrencyDeps): RecalculateFromCurrency =>
    ({ code, value }) => {
        const { rates, selectedCurrencies, mode } = deps.store.getState();
        const fiatAmount = parseFormattedNumber(value);

        if (Number.isNaN(fiatAmount) || fiatAmount === 0 || !rates[code]) {
            deps.store.setState({ btcValue: '', currencyValues: {} });

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

        deps.store.setState({
            btcValue: formattedBtc,
            currencyValues: newValues,
        });
    };
