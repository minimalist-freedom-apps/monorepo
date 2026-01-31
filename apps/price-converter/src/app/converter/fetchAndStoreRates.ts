import type { Result } from '@evolu/common';
import type { FetchRatesError, RatesMap } from '../../rates/FetchRates';
import type { State } from '../state/State';
import type { SetRates } from '../state/setRates';
import type { RecalculateFromBtc } from './recalculateFromBtc';

export type FetchAndStoreRates = () => Promise<void>;

export interface FetchAndStoreRatesDep {
    readonly fetchAndStoreRates: FetchAndStoreRates;
}

export interface FetchAndStoreRatesDeps {
    readonly fetchAverageRates: () => Promise<
        Result<RatesMap, FetchRatesError>
    >;
    readonly setState: (partial: Partial<State>) => void;
    readonly getState: () => State;
    readonly setRates: SetRates;
    readonly recalculateFromBtc: RecalculateFromBtc;
}

export const createFetchAndStoreRates =
    (deps: FetchAndStoreRatesDeps): FetchAndStoreRates =>
    async () => {
        deps.setState({ loading: true, error: '' });

        const result = await deps.fetchAverageRates();
        if (!result.ok) {
            deps.setState({
                error: 'Failed to fetch rates. Please try again.',
                loading: false,
            });
            return;
        }

        const fetchedRates = result.value;
        const now = Date.now();
        deps.setRates({ rates: fetchedRates, timestamp: now });

        // Recalculate values with new rates
        const btcValue = deps.getState().btcValue;
        if (btcValue) {
            deps.recalculateFromBtc({
                value: btcValue,
                rates: fetchedRates,
            });
        }

        deps.setState({ loading: false });
    };
