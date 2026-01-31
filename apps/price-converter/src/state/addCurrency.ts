import type { CurrencyCode } from '@evolu/common';
import { satsToBtc } from '@minimalistic-apps/bitcoin';
import {
    formatFiatWithCommas,
    parseFormattedNumber,
} from '@minimalistic-apps/utils';
import type { StoreDep } from './createStore';

export interface AddCurrencyParams {
    readonly code: CurrencyCode;
}

export type AddCurrency = (params: AddCurrencyParams) => void;

export interface AddCurrencyDep {
    readonly addCurrency: AddCurrency;
}

type AddCurrencyDeps = StoreDep;

export const createAddCurrency =
    (deps: AddCurrencyDeps): AddCurrency =>
    ({ code }) => {
        const { selectedCurrencies, btcValue, mode, rates, currencyValues } =
            deps.store.getState();

        if (selectedCurrencies.includes(code)) {
            deps.store.setState({ showModal: false });
            return;
        }

        const newCurrencies = [...selectedCurrencies, code];

        let newCurrencyValues = { ...currencyValues };

        if (btcValue && rates[code]) {
            const btcAmount =
                mode === 'Sats'
                    ? satsToBtc(parseFormattedNumber(btcValue))
                    : parseFormattedNumber(btcValue);

            const fiatAmount = btcAmount / rates[code].rate;
            newCurrencyValues = {
                ...newCurrencyValues,
                [code]: formatFiatWithCommas(fiatAmount),
            };
        }

        deps.store.setState({
            selectedCurrencies: newCurrencies,
            currencyValues: newCurrencyValues,
            showModal: false,
        });
    };
