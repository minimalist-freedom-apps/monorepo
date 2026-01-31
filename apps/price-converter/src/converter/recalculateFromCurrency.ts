import type { CurrencyCode } from '@evolu/common';
import {
    btcToSats,
    formatBtcWithCommas,
    formatSats,
} from '@minimalistic-apps/bitcoin';
import { formatFiatWithCommas } from '@minimalistic-apps/fiat';
import { parseFormattedNumber } from '@minimalistic-apps/utils';
import { asFiatAmount } from '../../../../packages/fiat/src/types';
import type { CurrencyValues } from '../state/State';
import type { StoreDep } from '../state/createStore';
import { bitcoinToFiat } from './bitcoinToFiat';
import { fiatToBitcoin } from './fiatToBitcoin';

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
        const {
            rates,
            selectedFiatCurrencies: selectedCurrencies,
            mode,
        } = deps.store.getState();
        const fiatAmount = asFiatAmount(parseFormattedNumber(value));

        if (Number.isNaN(fiatAmount) || fiatAmount === 0 || !rates[code]) {
            deps.store.setState({
                satsAmount: '',
                selectedFiatCurrenciesInputAmounts: {},
            });

            return;
        }

        const btcAmount = fiatToBitcoin(fiatAmount, rates[code].rate);
        const formattedBtc =
            mode === 'BTC'
                ? formatBtcWithCommas(btcAmount)
                : formatSats(btcToSats(btcAmount));

        const newValues = selectedCurrencies.reduce<CurrencyValues>(
            (acc, otherCode) => {
                if (otherCode !== code && rates[otherCode]) {
                    const otherFiatAmount = bitcoinToFiat(
                        btcAmount,
                        rates[otherCode].rate,
                    );
                    acc[otherCode] = formatFiatWithCommas(otherFiatAmount);
                } else if (otherCode === code) {
                    acc[otherCode] = value;
                }

                return acc;
            },
            {},
        );

        deps.store.setState({
            satsAmount: formattedBtc,
            selectedFiatCurrenciesInputAmounts: newValues,
        });
    };
