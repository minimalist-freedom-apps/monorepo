import type { CurrencyCode, RatesMap } from '../../rates/FetchRates';
import type { Mode, State } from './State';
import { STORAGE_KEYS } from './storageKeys';

export type LoadInitialState = () => void;

export interface LoadInitialStateDep {
    readonly loadInitialState: LoadInitialState;
}

export interface LoadInitialStateDeps {
    readonly setState: (partial: Partial<State>) => void;
    readonly loadFromLocalStorage: <T>(
        key: string,
        defaultValue?: T | null,
    ) => T | null;
}

export const createLoadInitialState =
    (deps: LoadInitialStateDeps): LoadInitialState =>
    () => {
        const savedRates = deps.loadFromLocalStorage<RatesMap>(
            STORAGE_KEYS.RATES,
        );
        const savedTimestamp = deps.loadFromLocalStorage<number>(
            STORAGE_KEYS.TIMESTAMP,
        );
        const savedCurrencies = deps.loadFromLocalStorage<CurrencyCode[]>(
            STORAGE_KEYS.SELECTED_CURRENCIES,
        );
        const savedMode = deps.loadFromLocalStorage<Mode>(
            STORAGE_KEYS.MODE,
            'BTC',
        );

        deps.setState({
            ...(savedRates && { rates: savedRates }),
            ...(savedTimestamp && { lastUpdated: savedTimestamp }),
            ...(savedCurrencies &&
                savedCurrencies.length > 0 && {
                    selectedCurrencies: savedCurrencies,
                }),
            ...(savedMode && { mode: savedMode }),
        });
    };
