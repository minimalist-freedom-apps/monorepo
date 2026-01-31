import type { CurrentDateTimeDep } from '@minimalistic-apps/datetime';
import type { FetchAverageRatesDep } from '../rates/fetchAverageRates';
import type { StoreDep } from '../state/createStore';
import type { RecalculateFromBtcDep } from './recalculateFromBtc';

export type FetchAndStoreRates = () => Promise<void>;

export interface FetchAndStoreRatesDep {
    readonly fetchAndStoreRates: FetchAndStoreRates;
}

type FetchAndStoreRatesDeps = StoreDep &
    FetchAverageRatesDep &
    RecalculateFromBtcDep &
    CurrentDateTimeDep;

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

        deps.store.setState({
            rates: result.value,
            lastUpdated: deps.currentDateTime(),
        });
        deps.recalculateFromBtc();

        deps.store.setState({ loading: false });
    };
