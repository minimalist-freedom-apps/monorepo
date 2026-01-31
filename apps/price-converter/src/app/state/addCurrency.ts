import { satsToBtc } from '@minimalistic-apps/bitcoin';
import {
    formatFiatWithCommas,
    parseFormattedNumber,
} from '@minimalistic-apps/utils';
import type { CurrencyCode } from '../../rates/FetchRates';
import type { State } from './State';
import { STORAGE_KEYS } from './storageKeys';

export const addCurrency =
    (deps: {
        readonly setState: (partial: Partial<State>) => void;
        readonly getState: () => State;
        readonly saveToLocalStorage: <T>(key: string, value: T) => void;
    }) =>
    (code: CurrencyCode) => {
        const { selectedCurrencies, btcValue, mode, rates, currencyValues } =
            deps.getState();

        if (selectedCurrencies.includes(code)) {
            deps.setState({ showModal: false });
            return;
        }

        const newCurrencies = [...selectedCurrencies, code];
        deps.saveToLocalStorage(
            STORAGE_KEYS.SELECTED_CURRENCIES,
            newCurrencies,
        );

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

        deps.setState({
            selectedCurrencies: newCurrencies,
            currencyValues: newCurrencyValues,
            showModal: false,
        });
    };
