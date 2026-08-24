import type { AbortableFiber, Run } from '@evolu/common';
import type { CurrentDateTimeDep } from '@minimalist-apps/datetime';
import type { CurrencyMap, FetchRatesDep, FetchRatesError } from '../rates/FetchRates';
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
        readonly run: Run;
    };

export const createFetchAndStoreRates = (deps: FetchAndStoreRatesDeps): FetchAndStoreRates => {
    let activeFiber: AbortableFiber<CurrencyMap, FetchRatesError> | null = null;

    return async () => {
        activeFiber?.abort();
        deps.appStore.setState({ loading: true, error: '' });

        let fiber: AbortableFiber<CurrencyMap, FetchRatesError>;

        try {
            fiber = deps.run.abortable(deps.fetchRates);
        } catch {
            deps.appStore.setState({
                loading: false,
                error: 'Failed to fetch rates. Please try again.',
            });

            return;
        }

        activeFiber = fiber;

        try {
            const result = await fiber;

            if (activeFiber !== fiber) {
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
            if (activeFiber === fiber) {
                deps.appStore.setState({
                    error: 'Failed to fetch rates. Please try again.',
                });
            }
        } finally {
            if (activeFiber === fiber) {
                activeFiber = null;
                deps.appStore.setState({ loading: false });
            }
        }
    };
};
