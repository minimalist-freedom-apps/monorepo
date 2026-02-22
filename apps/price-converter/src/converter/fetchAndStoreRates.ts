import type { CurrentDateTimeDep } from '@minimalist-apps/datetime';
import type { FetchRatesDep } from '../rates/FetchRates';
import type { AppStoreDep } from '../state/createAppStore';
import type { RecalculateFromBtcDep } from './recalculateFromBtc';

export type FetchAndStoreRates = () => Promise<void>;

export interface FetchAndStoreRatesDep {
    readonly fetchAndStoreRates: FetchAndStoreRates;
}

type FetchAndStoreRatesDeps = AppStoreDep &
    FetchRatesDep &
    RecalculateFromBtcDep &
    CurrentDateTimeDep;

export const createFetchAndStoreRates =
    (deps: FetchAndStoreRatesDeps): FetchAndStoreRates =>
    async () => {
        deps.appStore.setState({ loading: true, error: '' });

        const result = await deps.fetchRates();

        if (!result.ok) {
            deps.appStore.setState({
                error: 'Failed to fetch rates. Please try again.',
                loading: false,
            });

            return;
        }

        deps.appStore.setState({
            rates: result.value,
            lastUpdated: deps.currentDateTime(),
        });
        deps.recalculateFromBtc();

        deps.appStore.setState({ loading: false });
    };
