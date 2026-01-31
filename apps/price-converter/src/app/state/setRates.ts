import type { RatesMap } from '../../rates/FetchRates';
import type { State } from './State';
import { STORAGE_KEYS } from './storageKeys';

export const setRates =
    (deps: {
        readonly setState: (partial: Partial<State>) => void;
        readonly saveToLocalStorage: <T>(key: string, value: T) => void;
    }) =>
    (rates: RatesMap, timestamp: number) => {
        deps.setState({ rates, lastUpdated: timestamp });
        deps.saveToLocalStorage(STORAGE_KEYS.RATES, rates);
        deps.saveToLocalStorage(STORAGE_KEYS.TIMESTAMP, timestamp);
    };
