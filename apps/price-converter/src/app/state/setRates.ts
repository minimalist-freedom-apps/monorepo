import type { RatesMap } from '../../rates/FetchRates';
import type { State } from './State';
import { STORAGE_KEYS } from './storageKeys';

export interface SetRatesParams {
    readonly rates: RatesMap;
    readonly timestamp: number;
}

export type SetRates = (params: SetRatesParams) => void;

export interface SetRatesDep {
    readonly setRates: SetRates;
}

export interface SetRatesDeps {
    readonly setState: (partial: Partial<State>) => void;
    readonly saveToLocalStorage: <T>(key: string, value: T) => void;
}

export const createSetRates =
    (deps: SetRatesDeps): SetRates =>
    ({ rates, timestamp }) => {
        deps.setState({ rates, lastUpdated: timestamp });
        deps.saveToLocalStorage(STORAGE_KEYS.RATES, rates);
        deps.saveToLocalStorage(STORAGE_KEYS.TIMESTAMP, timestamp);
    };
