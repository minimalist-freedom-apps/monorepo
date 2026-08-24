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
    CurrentDateTimeDep & {
        readonly createAbortController: () => AbortController;
    };

export const createFetchAndStoreRates = (deps: FetchAndStoreRatesDeps): FetchAndStoreRates => {
    let latestRequest = 0;
    let activeAbortController: AbortController | null = null;

    return async () => {
        activeAbortController?.abort();
        const abortController = deps.createAbortController();
        activeAbortController = abortController;
        latestRequest += 1;
        const request = latestRequest;
        deps.appStore.setState({ loading: true, error: '' });

        try {
            const result = await deps.fetchRates({ signal: abortController.signal });

            if (request !== latestRequest) {
                return;
            }

            if (!result.ok) {
                deps.appStore.setState({
                    error: 'Failed to fetch rates. Please try again.',
                });

                return;
            }

            deps.appStore.setState({
                rates: result.value,
                lastUpdated: deps.currentDateTime(),
            });
            deps.recalculateFromBtc();
        } catch {
            if (request === latestRequest) {
                deps.appStore.setState({
                    error: 'Failed to fetch rates. Please try again.',
                });
            }
        } finally {
            if (request === latestRequest) {
                activeAbortController = null;
                deps.appStore.setState({ loading: false });
            }
        }
    };
};
