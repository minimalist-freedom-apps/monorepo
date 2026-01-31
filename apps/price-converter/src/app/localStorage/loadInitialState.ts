import type { CurrencyCode } from '@evolu/common';
import type { LocalStorageDep } from '@minimalistic-apps/local-storage';
import type { CurrencyMap } from '../../rates/FetchRates';
import type { Mode } from '../../state/State';
import type { StoreDep } from '../../state/createStore';
import { STORAGE_KEYS } from './storageKeys';

export type LoadInitialState = () => void;

export interface LoadInitialStateDep {
    readonly loadInitialState: LoadInitialState;
}

type LoadInitialStateDeps = StoreDep & LocalStorageDep;

export const createLoadInitialState =
    (deps: LoadInitialStateDeps): LoadInitialState =>
    () => {
        const savedRatesResult = deps.localStorage.load<CurrencyMap>(
            STORAGE_KEYS.RATES,
        );
        const savedTimestampResult = deps.localStorage.load<number>(
            STORAGE_KEYS.TIMESTAMP,
        );
        const savedCurrenciesResult = deps.localStorage.load<CurrencyCode[]>(
            STORAGE_KEYS.SELECTED_CURRENCIES,
        );
        const savedModeResult = deps.localStorage.load<Mode>(STORAGE_KEYS.MODE);

        const savedRates = savedRatesResult.ok ? savedRatesResult.value : null;
        const savedTimestamp = savedTimestampResult.ok
            ? savedTimestampResult.value
            : null;
        const savedCurrencies = savedCurrenciesResult.ok
            ? savedCurrenciesResult.value
            : null;
        const savedMode = savedModeResult.ok ? savedModeResult.value : 'BTC';

        deps.store.setState({
            ...(savedRates && { rates: savedRates }),
            ...(savedTimestamp && { lastUpdated: savedTimestamp }),
            ...(savedCurrencies &&
                savedCurrencies.length > 0 && {
                    selectedFiatCurrencies: savedCurrencies,
                }),
            ...(savedMode && { mode: savedMode }),
        });
    };
