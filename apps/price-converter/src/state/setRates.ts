import type { RatesMap } from '../rates/FetchRates';
import type { StoreDep } from './createStore';

export interface SetRatesParams {
    readonly rates: RatesMap;
    readonly timestamp: number;
}

export type SetRates = (params: SetRatesParams) => void;

export interface SetRatesDep {
    readonly setRates: SetRates;
}

type SetRatesDeps = StoreDep;

export const createSetRates =
    (deps: SetRatesDeps): SetRates =>
    ({ rates, timestamp }) => {
        deps.store.setState({ rates, lastUpdated: timestamp });
    };
