import type { FetchAverageRatesDep } from '../rates/fetchAverageRates';
import type { StoreDep } from '../state/createStore';
import type { SetRatesDep } from '../state/setRates';
import type { RecalculateFromBtcDep } from './recalculateFromBtc';

export type FetchAndStoreRates = () => Promise<void>;

export interface FetchAndStoreRatesDep {
    readonly fetchAndStoreRates: FetchAndStoreRates;
}

type FetchAndStoreRatesDeps = StoreDep &
    FetchAverageRatesDep &
    SetRatesDep &
    RecalculateFromBtcDep;

export const createFetchAndStoreRates =
    (deps: FetchAndStoreRatesDeps): FetchAndStoreRates =>
    async () => {
        deps.store.setState({ loading: true, error: '' });

        const result = await deps.fetchAverageRates();
        if (!result.ok) {
            deps.store.setState({
                error: 'Failed to fetch rates. Please try again.',
                loading: false,
            });
            return;
        }

        const fetchedRates = result.value;
        const now = Date.now();
        deps.setRates({ rates: fetchedRates, timestamp: now });

        // Recalculate values with new rates
        const btcValue = deps.store.getState().btcValue;
        if (btcValue) {
            deps.recalculateFromBtc({
                value: btcValue,
                rates: fetchedRates,
            });
        }

        deps.store.setState({ loading: false });
    };
